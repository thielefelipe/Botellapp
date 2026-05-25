import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo");
    const fecha = searchParams.get("fecha");

    const where: Record<string, unknown> = { negocioId: session.negocioId };

    if (tipo) {
      where.tipo = tipo;
    }

    if (fecha) {
      const start = new Date(fecha);
      start.setHours(0, 0, 0, 0);
      const end = new Date(fecha);
      end.setHours(23, 59, 59, 999);
      where.fecha = { gte: start, lte: end };
    }

    const movimientos = await prisma.movimientoCaja.findMany({
      where,
      include: {
        usuario: { select: { id: true, nombre: true, username: true } },
      },
      orderBy: { fecha: "desc" },
    });

    // Compute balance: sum ingresos - sum egresos (solo de este negocio)
    const allMovimientos = await prisma.movimientoCaja.findMany({
      where: { negocioId: session.negocioId },
      select: { tipo: true, monto: true },
    });

    const totalIngresos = allMovimientos.filter(m => m.tipo === "ingreso").reduce((s, m) => s + m.monto, 0);
    const totalEgresos = allMovimientos.filter(m => m.tipo === "egreso").reduce((s, m) => s + m.monto, 0);
    const balance = totalIngresos - totalEgresos;

    return NextResponse.json({ movimientos, balance, totalIngresos, totalEgresos }, { status: 200 });
  } catch (error) {
    console.error("GET caja error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "PROPIETARIO"].includes(session.rol)) {
      return NextResponse.json({
        error: "Sin permisos. Solo admins y propietarios pueden registrar movimientos manuales.",
      }, { status: 403 });
    }

    const body = await req.json();
    const { tipo, categoria, descripcion, monto, metodoPago = "efectivo" } = body;

    if (!tipo || !categoria || !descripcion || monto === undefined) {
      return NextResponse.json(
        { error: "tipo, categoria, descripcion y monto son requeridos" },
        { status: 400 }
      );
    }

    if (!["ingreso", "egreso"].includes(tipo)) {
      return NextResponse.json({ error: "tipo debe ser ingreso o egreso" }, { status: 400 });
    }

    const movimiento = await prisma.movimientoCaja.create({
      data: {
        tipo,
        categoria,
        descripcion,
        monto: Number(monto),
        metodoPago,
        usuarioId: session.id,
        negocioId: session.negocioId,
      },
      include: {
        usuario: { select: { id: true, nombre: true, username: true } },
      },
    });

    return NextResponse.json({ movimiento }, { status: 201 });
  } catch (error) {
    console.error("POST caja error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
