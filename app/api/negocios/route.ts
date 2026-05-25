import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// API pública para obtener negocios por slug de cliente
// Usada en la página de login para mostrar las sucursales disponibles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clienteSlug = searchParams.get("clienteSlug");

    if (!clienteSlug) {
      return NextResponse.json({ error: "clienteSlug es requerido" }, { status: 400 });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { slug: clienteSlug, activo: true },
      include: {
        negocios: {
          where: { activo: true },
          select: { id: true, nombre: true, slug: true },
          orderBy: { nombre: "asc" },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      cliente: { id: cliente.id, nombre: cliente.nombre, slug: cliente.slug },
      negocios: cliente.negocios,
    });
  } catch (error) {
    console.error("GET negocios error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
