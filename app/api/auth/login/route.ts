import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const token = signToken({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
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
