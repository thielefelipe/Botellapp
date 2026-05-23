import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const config = await prisma.configuracionTienda.findFirst();
    return NextResponse.json(config);
  } catch (error) {
    console.error("GET config error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    if (!["ADMIN", "PROPIETARIO"].includes(session.rol)) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await req.json();
    const { nombre, rut, direccion, telefono, email, whatsapp, moneda, reporteEmail, reporteWhats } = body;

    const existing = await prisma.configuracionTienda.findFirst();
    let config;
    if (existing) {
      config = await prisma.configuracionTienda.update({
        where: { id: existing.id },
        data: { nombre, rut, direccion, telefono, email, whatsapp, moneda, reporteEmail, reporteWhats },
      });
    } else {
      config = await prisma.configuracionTienda.create({
        data: { nombre: nombre || "BOTELLAPP", rut, direccion, telefono, email, whatsapp, moneda: moneda || "CLP", reporteEmail: reporteEmail || false, reporteWhats: reporteWhats || false },
      });
    }
    return NextResponse.json(config);
  } catch (error) {
    console.error("PUT config error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
