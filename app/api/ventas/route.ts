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

    const ventas = await prisma.venta.findMany({
      include: {
        items: { include: { producto: true } },
        usuario: { select: { id: true, nombre: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ventas }, { status: 200 });
  } catch (error) {
    console.error("GET ventas error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { items, metodoPago = "efectivo", descuento = 0, notas } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items requeridos" }, { status: 400 });
    }

    const subtotal = items.reduce(
      (acc: number, item: { cantidad: number; precio: number }) => acc + item.cantidad * item.precio,
      0
    );
    const total = subtotal - descuento;
    const numero = generateNumero("V");

    const venta = await prisma.venta.create({
      data: {
        numero,
        subtotal,
        total,
        descuento,
        metodoPago,
        notas,
        usuarioId: session.id,
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
        items: { include: { producto: true } },
        usuario: { select: { id: true, nombre: true, email: true } },
      },
    });

    // Update stock for each product
    await Promise.all(
      items.map((item: { productoId: number; cantidad: number }) =>
        prisma.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } },
        })
      )
    );

    // Create caja ingreso record
    await prisma.movimientoCaja.create({
      data: {
        tipo: "ingreso",
        categoria: "venta",
        descripcion: `Venta ${numero}`,
        monto: total,
        metodoPago,
        usuarioId: session.id,
      },
    });

    return NextResponse.json({ venta }, { status: 201 });
  } catch (error) {
    console.error("POST ventas error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
