import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const categorias = await prisma.categoria.findMany({
      where: { negocioId: session.negocioId },
      include: {
        _count: { select: { productos: true } },
      },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(categorias, { status: 200 });
  } catch (error) {
    console.error("GET categorias error:", error);
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
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await req.json();
    const { nombre, color, icono } = body;

    if (!nombre) {
      return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });
    }

    const categoria = await prisma.categoria.create({
      data: {
        nombre,
        color: color ?? "#6366f1",
        icono: icono ?? "🍷",
        negocioId: session.negocioId,
      },
      include: {
        _count: { select: { productos: true } },
      },
    });

    return NextResponse.json({ categoria }, { status: 201 });
  } catch (error) {
    console.error("POST categorias error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
