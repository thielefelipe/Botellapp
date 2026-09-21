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

    const proveedor = await prisma.proveedor.findFirst({
      where: { id: Number(proveedorId), negocioId: session.negocioId },
    });
    if (!proveedor) {
      return NextResponse.json(
        { error: "El proveedor no existe o no pertenece a este negocio" },
        { status: 400 }
      );
    }

    const itemsCompra: { productoId: number; cantidad: number; precio: number; subtotal: number }[] = [];
    for (const item of items as { productoId: number; cantidad: number; precio: number }[]) {
      const productoId = Number(item.productoId);
      const cantidad = Number(item.cantidad);
      const precio = Number(item.precio);
      if (
        !Number.isInteger(productoId) ||
        !Number.isInteger(cantidad) || cantidad <= 0 ||
        !Number.isFinite(precio) || precio < 0
      ) {
        return NextResponse.json({ error: "Item inválido" }, { status: 400 });
      }
      itemsCompra.push({ productoId, cantidad, precio, subtotal: cantidad * precio });
    }

    const productoIds = [...new Set(itemsCompra.map((i) => i.productoId))];
    const productosCount = await prisma.producto.count({
      where: { id: { in: productoIds }, negocioId: session.negocioId },
    });
    if (productosCount !== productoIds.length) {
      return NextResponse.json(
        { error: "Uno o más productos no existen o no pertenecen a este negocio" },
        { status: 400 }
      );
    }

    const total = itemsCompra.reduce((acc, item) => acc + item.subtotal, 0);
    const numero = generateNumero("C");

    const compra = await prisma.$transaction(async (tx) => {
      const compra = await tx.compra.create({
        data: {
          numero,
          total,
          notas,
          proveedorId: proveedor.id,
          negocioId: session.negocioId,
          items: { create: itemsCompra },
        },
        include: {
          proveedor: true,
          items: { include: { producto: true } },
        },
      });

      for (const item of itemsCompra) {
        await tx.producto.update({
          where: { id: item.productoId, negocioId: session.negocioId },
          data: { stock: { increment: item.cantidad } },
        });
      }

      await tx.movimientoCaja.create({
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

      return compra;
    });

    return NextResponse.json({ compra }, { status: 201 });
  } catch (error) {
    console.error("POST compras error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
