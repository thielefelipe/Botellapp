import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const now = new Date();

    // Today boundaries
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // This month boundaries
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Ventas hoy
    const ventasHoyResult = await prisma.venta.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
        estado: "completada",
      },
    });

    // Ventas este mes
    const ventasMesResult = await prisma.venta.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        estado: "completada",
      },
    });

    // Productos con stock bajo (stock < stockMinimo)
    const todosProductos = await prisma.producto.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        stock: true,
        stockMinimo: true,
        categoria: { select: { nombre: true, color: true } },
      },
      orderBy: { stock: "asc" },
    });
    const productosStockBajo = todosProductos.filter((p) => p.stock < p.stockMinimo);

    // Caja balance
    const allMovimientos = await prisma.movimientoCaja.findMany({
      select: { tipo: true, monto: true },
    });
    const cajaBalance = allMovimientos.reduce((acc, m) => {
      return m.tipo === "ingreso" ? acc + m.monto : acc - m.monto;
    }, 0);

    // Ventas recientes (last 5)
    const ventasRecientes = await prisma.venta.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        usuario: { select: { id: true, nombre: true } },
        items: { include: { producto: { select: { nombre: true } } } },
      },
    });

    // Top 5 productos by quantity sold this month
    const topProductosRaw = await prisma.itemVenta.groupBy({
      by: ["productoId"],
      _sum: { cantidad: true },
      where: {
        venta: {
          createdAt: { gte: monthStart, lte: monthEnd },
          estado: "completada",
        },
      },
      orderBy: { _sum: { cantidad: "desc" } },
      take: 5,
    });

    const topProductos = await Promise.all(
      topProductosRaw.map(async (item) => {
        const producto = await prisma.producto.findUnique({
          where: { id: item.productoId },
          select: { id: true, nombre: true, precioVenta: true },
        });
        return {
          producto,
          cantidadVendida: item._sum.cantidad ?? 0,
        };
      })
    );

    return NextResponse.json(
      {
        ventasHoy: ventasHoyResult._sum.total ?? 0,
        ventasMes: ventasMesResult._sum.total ?? 0,
        productosStockBajo,
        cajaBalance,
        ventasRecientes,
        topProductos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET dashboard error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
