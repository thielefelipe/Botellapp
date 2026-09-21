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
      where: { negocioId: session.negocioId },
      include: {
        items: { include: { producto: true } },
        usuario: { select: { id: true, nombre: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ventas }, { status: 200 });
  } catch (error) {
    console.error("GET ventas error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

class VentaError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
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

    const cantidadesPorProducto = new Map<number, number>();
    for (const item of items as { productoId: number; cantidad: number }[]) {
      const productoId = Number(item.productoId);
      const cantidad = Number(item.cantidad);
      if (!Number.isInteger(productoId) || !Number.isInteger(cantidad) || cantidad <= 0) {
        return NextResponse.json({ error: "Item inválido" }, { status: 400 });
      }
      cantidadesPorProducto.set(productoId, (cantidadesPorProducto.get(productoId) ?? 0) + cantidad);
    }

    const productoIds = [...cantidadesPorProducto.keys()];

    // Precio autoritativo: siempre el del catálogo de ESTE negocio, nunca el que mande el cliente.
    const productos = await prisma.producto.findMany({
      where: { id: { in: productoIds }, negocioId: session.negocioId },
    });

    if (productos.length !== productoIds.length) {
      return NextResponse.json(
        { error: "Uno o más productos no existen o no pertenecen a este negocio" },
        { status: 400 }
      );
    }

    for (const producto of productos) {
      const cantidad = cantidadesPorProducto.get(producto.id)!;
      if (cantidad > producto.stock) {
        return NextResponse.json(
          { error: `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock})` },
          { status: 400 }
        );
      }
    }

    const precioPorProducto = new Map(productos.map((p) => [p.id, p.precioVenta]));
    const itemsVenta = [...cantidadesPorProducto.entries()].map(([productoId, cantidad]) => {
      const precio = precioPorProducto.get(productoId)!;
      return { productoId, cantidad, precio, subtotal: cantidad * precio };
    });

    const subtotal = itemsVenta.reduce((acc, item) => acc + item.subtotal, 0);
    const descuentoNum = Number(descuento) || 0;
    if (descuentoNum < 0 || descuentoNum > subtotal) {
      return NextResponse.json({ error: "Descuento inválido" }, { status: 400 });
    }
    const total = subtotal - descuentoNum;
    const numero = generateNumero("V");

    const venta = await prisma.$transaction(async (tx) => {
      const venta = await tx.venta.create({
        data: {
          numero,
          subtotal,
          total,
          descuento: descuentoNum,
          metodoPago,
          notas,
          usuarioId: session.id,
          negocioId: session.negocioId,
          items: { create: itemsVenta },
        },
        include: {
          items: { include: { producto: true } },
          usuario: { select: { id: true, nombre: true, username: true } },
        },
      });

      // Decremento atómico y condicionado al stock disponible: evita vender
      // más stock del real si dos ventas concurrentes compiten por el mismo producto.
      for (const item of itemsVenta) {
        const updated = await tx.producto.updateMany({
          where: { id: item.productoId, negocioId: session.negocioId, stock: { gte: item.cantidad } },
          data: { stock: { decrement: item.cantidad } },
        });
        if (updated.count === 0) {
          throw new VentaError(`Stock insuficiente para el producto ${item.productoId}`);
        }
      }

      await tx.movimientoCaja.create({
        data: {
          tipo: "ingreso",
          categoria: "venta",
          descripcion: `Venta ${numero}`,
          monto: total,
          metodoPago,
          usuarioId: session.id,
          negocioId: session.negocioId,
        },
      });

      return venta;
    });

    return NextResponse.json({ venta }, { status: 201 });
  } catch (error) {
    if (error instanceof VentaError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST ventas error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
