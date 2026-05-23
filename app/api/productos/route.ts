import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const productos = await prisma.producto.findMany({
      where: { activo: true },
      include: { categoria: true },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(productos, { status: 200 });
  } catch (error) {
    console.error("GET productos error:", error);
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
    const { nombre, descripcion, precioCompra, precioVenta, stock, stockMinimo, unidad, categoriaId, codigo } = body;

    if (!nombre || precioVenta === undefined) {
      return NextResponse.json({ error: "Nombre y precio de venta son requeridos" }, { status: 400 });
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precioCompra: precioCompra ?? 0,
        precioVenta,
        stock: stock ?? 0,
        stockMinimo: stockMinimo ?? 5,
        unidad: unidad ?? "unidad",
        categoriaId: categoriaId ?? null,
        codigo: codigo ?? null,
      },
      include: { categoria: true },
    });

    return NextResponse.json({ producto }, { status: 201 });
  } catch (error) {
    console.error("POST productos error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
