import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";

async function getDashboardData() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    ventasHoy,
    ventasMes,
    totalVentas,
    productosStockBajo,
    movimientos,
    ventasRecientes,
    totalProductos,
    totalProveedores,
  ] = await Promise.all([
    prisma.venta.aggregate({
      where: { createdAt: { gte: startOfDay } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.venta.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.venta.aggregate({ _sum: { total: true } }),
    prisma.producto.count({
      where: { activo: true, stock: { lte: prisma.producto.fields.stockMinimo as unknown as number } },
    }).catch(() => prisma.producto.findMany({ where: { activo: true } }).then(p => p.filter(pr => pr.stock <= pr.stockMinimo).length)),
    prisma.movimientoCaja.aggregate({
      _sum: { monto: true },
      where: { tipo: "ingreso" },
    }),
    prisma.venta.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { usuario: { select: { nombre: true } }, items: { include: { producto: { select: { nombre: true } } } } },
    }),
    prisma.producto.count({ where: { activo: true } }),
    prisma.proveedor.count({ where: { activo: true } }),
  ]);

  const egresos = await prisma.movimientoCaja.aggregate({
    _sum: { monto: true },
    where: { tipo: "egreso" },
  });

  const ingresos = movimientos._sum.monto || 0;
  const totalEgresos = egresos._sum.monto || 0;
  const cajaBalance = ingresos - totalEgresos;

  return {
    ventasHoy: ventasHoy._sum.total || 0,
    ventasHoyCount: ventasHoy._count,
    ventasMes: ventasMes._sum.total || 0,
    ventasMesCount: ventasMes._count,
    totalVentas: totalVentas._sum.total || 0,
    productosStockBajo: typeof productosStockBajo === 'number' ? productosStockBajo : 0,
    cajaBalance,
    ventasRecientes,
    totalProductos,
    totalProveedores,
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  const data = await getDashboardData();

  const stats = [
    {
      label: "Ventas Hoy",
      value: formatCLP(data.ventasHoy),
      sub: `${data.ventasHoyCount} transacciones`,
      icon: "💰",
      color: "from-purple-600/20 to-purple-600/5",
      border: "border-purple-500/30",
      text: "text-purple-400",
    },
    {
      label: "Ventas del Mes",
      value: formatCLP(data.ventasMes),
      sub: `${data.ventasMesCount} transacciones`,
      icon: "📅",
      color: "from-amber-600/20 to-amber-600/5",
      border: "border-amber-500/30",
      text: "text-amber-400",
    },
    {
      label: "Balance Caja",
      value: formatCLP(data.cajaBalance),
      sub: "Ingresos menos egresos",
      icon: "🏦",
      color: "from-green-600/20 to-green-600/5",
      border: "border-green-500/30",
      text: "text-green-400",
    },
    {
      label: "Stock Bajo",
      value: String(data.productosStockBajo),
      sub: "Productos bajo mínimo",
      icon: "⚠️",
      color: "from-red-600/20 to-red-600/5",
      border: "border-red-500/30",
      text: "text-red-400",
    },
  ];

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            ¡Buen día, {session?.nombre.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString("es-CL", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-slate-400">Sistema activo</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-2xl p-5`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.text}`}>{stat.value}</p>
                <p className="text-slate-500 text-xs mt-1">{stat.sub}</p>
              </div>
              <span className="text-3xl opacity-80">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Quick stats */}
        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4">Resumen General</h3>
          <div className="space-y-4">
            {[
              { label: "Total Productos", value: data.totalProductos, icon: "📦" },
              { label: "Proveedores Activos", value: data.totalProveedores, icon: "🏭" },
              { label: "Total Ventas Históricas", value: formatCLP(data.totalVentas), icon: "💹" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#2d3148] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-slate-400">{item.label}</span>
                </div>
                <span className="font-semibold text-white text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="xl:col-span-2 bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4">Últimas Ventas</h3>
          <div className="space-y-3">
            {data.ventasRecientes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <span className="text-4xl block mb-2">💸</span>
                <p>No hay ventas registradas aún</p>
              </div>
            ) : (
              data.ventasRecientes.map((venta) => (
                <div
                  key={venta.id}
                  className="flex items-center justify-between p-3 bg-[#0f1117] rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      <span className="text-sm">💰</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{venta.numero}</p>
                      <p className="text-xs text-slate-500">
                        {venta.usuario.nombre} · {venta.items.length} productos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">{formatCLP(venta.total)}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(venta.createdAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="font-semibold text-white mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/dashboard/ventas", icon: "💰", label: "Nueva Venta", color: "hover:border-purple-500/50 hover:bg-purple-500/10" },
            { href: "/dashboard/compras", icon: "🛒", label: "Nueva Compra", color: "hover:border-amber-500/50 hover:bg-amber-500/10" },
            { href: "/dashboard/inventario", icon: "📦", label: "Ver Inventario", color: "hover:border-blue-500/50 hover:bg-blue-500/10" },
            { href: "/dashboard/caja", icon: "🏦", label: "Ver Caja", color: "hover:border-green-500/50 hover:bg-green-500/10" },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className={`bg-[#1a1d27] border border-[#2d3148] rounded-xl p-4 text-center transition-all duration-150 ${action.color} group`}
            >
              <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{action.icon}</span>
              <span className="text-sm font-medium text-slate-300">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
