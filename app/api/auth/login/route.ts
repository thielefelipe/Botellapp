import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { negocioId, username, password } = await req.json();

    if (!negocioId || !username || !password) {
      return NextResponse.json(
        { error: "Negocio, usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        negocioId_username: {
          negocioId: Number(negocioId),
          username: username.trim(),
        },
      },
      include: {
        negocio: {
          include: { cliente: true },
        },
      },
    });

    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const token = signToken({
      id: usuario.id,
      username: usuario.username,
      nombre: usuario.nombre,
      rol: usuario.rol,
      negocioId: usuario.negocioId,
      clienteId: usuario.negocio.clienteId,
      negocioNombre: usuario.negocio.nombre,
    });

    const { password: _, ...usuarioSinPassword } = usuario;

    const response = NextResponse.json({ usuario: usuarioSinPassword }, { status: 200 });
    response.cookies.set("botellapp-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
