import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateNumero } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const compras = await prisma.compra.findMany({
      where: { negocioId: session.negocioId },
      include: {
        proveedor: true,
        items: { include: { producto: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(compras, { status: 200 });
  } catch (error) {
    console.error("GET compras error:", error);
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
    const { proveedorId, items, notas } = body;

    if (!proveedorId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Proveedor e items son requeridos" }, { status: 400 });
    }

    const total = items.reduce(
      (acc: number, item: { cantidad: number; precio: number }) => acc + item.cantidad * item.precio,
      0
    );
    const numero = generateNumero("C");

    const compra = await prisma.compra.create({
      data: {
        numero,
        total,
        notas,
        proveedorId,
        negocioId: session.negocioId,
        items: {
          create: items.map((item: { productoId: number; cantidad: number; precio: number }) => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            precio: item.precio,
            subtotal: item.cantidad * item.precio,
          })),
        },
      },
      include: {
        proveedor: true,
        items: { include: { producto: true } },
      },
    });

    // Increment stock for each product
    await Promise.all(
      items.map((item: { productoId: number; cantidad: number }) =>
        prisma.producto.update({
          where: { id: item.productoId },
          data: { stock: { increment: item.cantidad } },
        })
      )
    );

    // Create caja egreso record
    await prisma.movimientoCaja.create({
      data: {
        tipo: "egreso",
        categoria: "compra",
        descripcion: `Compra ${numero}`,
        monto: total,
        metodoPago: "efectivo",
        usuarioId: session.id,
        negocioId: session.negocioId,
      },
    });

    return NextResponse.json({ compra }, { status: 201 });
  } catch (error) {
    console.error("POST compras error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
