import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });

    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ usuario }, { status: 200 });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
