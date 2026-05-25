import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    if (!["ADMIN", "PROPIETARIO"].includes(session.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const usuarios = await prisma.usuario.findMany({
      where: { negocioId: session.negocioId },
      select: {
        id: true,
        nombre: true,
        username: true,
        rol: true,
        activo: true,
        createdAt: true,
        negocioId: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("GET usuarios error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    if (session.rol !== "ADMIN") return NextResponse.json({ error: "Sin permisos" }, { status: 403 });

    const { nombre, username, password, rol } = await req.json();

    if (!nombre || !username || !password) {
      return NextResponse.json({ error: "Nombre, usuario y contraseña son requeridos" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        username: username.trim(),
        password: hashed,
        rol: rol || "VENDEDOR",
        negocioId: session.negocioId,
      },
      select: {
        id: true,
        nombre: true,
        username: true,
        rol: true,
        activo: true,
        createdAt: true,
        negocioId: true,
      },
    });
    return NextResponse.json(usuario, { status: 201 });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e.code === "P2002") return NextResponse.json({ error: "Usuario ya existe en este negocio" }, { status: 400 });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
