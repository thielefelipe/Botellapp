import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const proveedores = await prisma.proveedor.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(proveedores, { status: 200 });
  } catch (error) {
    console.error("GET proveedores error:", error);
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
    const { nombre, rut, telefono, email, direccion } = body;

    if (!nombre) {
      return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });
    }

    const proveedor = await prisma.proveedor.create({
      data: {
        nombre,
        rut: rut ?? null,
        telefono: telefono ?? null,
        email: email ?? null,
        direccion: direccion ?? null,
      },
    });

    return NextResponse.json({ proveedor }, { status: 201 });
  } catch (error) {
    console.error("POST proveedores error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
