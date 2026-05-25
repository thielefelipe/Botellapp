import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "PROPIETARIO"].includes(session.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id } = await params;
    const productoId = parseInt(id);
    if (isNaN(productoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await req.json();
    const { nombre, descripcion, precioCompra, precioVenta, stock, stockMinimo, unidad, categoriaId, codigo } = body;

    const producto = await prisma.producto.update({
      where: { id: productoId, negocioId: session.negocioId },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(precioCompra !== undefined && { precioCompra }),
        ...(precioVenta !== undefined && { precioVenta }),
        ...(stock !== undefined && { stock }),
        ...(stockMinimo !== undefined && { stockMinimo }),
        ...(unidad !== undefined && { unidad }),
        ...(categoriaId !== undefined && { categoriaId }),
        ...(codigo !== undefined && { codigo }),
      },
      include: { categoria: true },
    });

    return NextResponse.json({ producto }, { status: 200 });
  } catch (error) {
    console.error("PUT producto error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (!["ADMIN", "PROPIETARIO"].includes(session.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const { id } = await params;
    const productoId = parseInt(id);
    if (isNaN(productoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.producto.update({
      where: { id: productoId, negocioId: session.negocioId },
      data: { activo: false },
    });

    return NextResponse.json({ message: "Producto desactivado" }, { status: 200 });
  } catch (error) {
    console.error("DELETE producto error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
