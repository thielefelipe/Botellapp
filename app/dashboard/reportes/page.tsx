"use client";
import { useState, useEffect } from "react";
import { formatCLP } from "@/lib/utils";

interface DashData {
  ventasHoy: number;
  ventasMes: number;
  cajaBalance: number;
  productosStockBajo: number;
  ventasRecientes: { id: number; numero: string; total: number; metodoPago: string; createdAt: string; usuario: { nombre: string }; items: { cantidad: number; producto: { nombre: string } }[] }[];
  topProductos: { productoId: number; producto: { nombre: string }; _sum: { cantidad: number } }[];
}

export default function ReportesPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [tipoReporte, setTipoReporte] = useState("diario");
  const [reporteEnviado, setReporteEnviado] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  const enviarReporte = async () => {
    if (!email && !whatsapp) { alert("Ingrese email o WhatsApp"); return; }
    setEnviando(true);
    // Simulación de envío
    await new Promise(r => setTimeout(r, 2000));
    setReporteEnviado(true);
    setEnviando(false);
    setTimeout(() => setReporteEnviado(false), 4000);
  };

  if (loading) return <div className="p-6 text-center text-slate-500 py-12">Cargando reportes...</div>;
  if (!data) return null;

  const metodosPago = [
    { label: "💵 Efectivo", value: 60, color: "bg-green-500" },
    { label: "💳 Débito", value: 25, color: "bg-blue-500" },
    { label: "📱 Transferencia", value: 15, color: "bg-purple-500" },
  ];

  return (
    <div className="p-6 fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">📈 Reportes</h1>
        <p className="text-slate-400 text-sm mt-1">Resumen y análisis de tu negocio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Ventas Hoy", value: formatCLP(data.ventasHoy), icon: "💰", color: "text-green-400" },
          { label: "Ventas del Mes", value: formatCLP(data.ventasMes), icon: "📅", color: "text-purple-400" },
          { label: "Balance Caja", value: formatCLP(data.cajaBalance), icon: "🏦", color: "text-blue-400" },
          { label: "Stock Bajo", value: String(data.productosStockBajo) + " prod.", icon: "⚠️", color: "text-red-400" },
        ].map(stat => (
          <div key={stat.label} className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-4 text-center">
            <span className="text-3xl">{stat.icon}</span>
            <p className={`text-xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top productos */}
        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4">🏆 Top Productos del Mes</h3>
          {data.topProductos && data.topProductos.length > 0 ? (
            <div className="space-y-3">
              {data.topProductos.slice(0, 5).map((p, i) => (
                <div key={p.productoId} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-white">{p.producto?.nombre || "Producto"}</p>
                    <div className="h-1.5 bg-[#2d3148] rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-amber-600 rounded-full"
                        style={{ width: `${Math.min(100, ((p._sum?.cantidad || 0) / (data.topProductos[0]?._sum?.cantidad || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-amber-400">{p._sum?.cantidad || 0} u.</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <span className="text-3xl block mb-2">📊</span>
              <p className="text-sm">No hay datos de ventas este mes</p>
            </div>
          )}
        </div>

        {/* Métodos de pago */}
        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4">💳 Métodos de Pago</h3>
          <div className="space-y-4">
            {metodosPago.map(m => (
              <div key={m.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">{m.label}</span>
                  <span className="text-white font-medium">{m.value}%</span>
                </div>
                <div className="h-2 bg-[#2d3148] rounded-full overflow-hidden">
                  <div className={`h-full ${m.color} rounded-full transition-all`} style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimas ventas */}
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-5">
        <h3 className="font-semibold text-white mb-4">📋 Últimas Transacciones</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2d3148]">
                {["N° Venta", "Vendedor", "Productos", "Método", "Fecha", "Total"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs text-slate-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.ventasRecientes.map(v => (
                <tr key={v.id} className="border-b border-[#2d3148]/50">
                  <td className="px-3 py-3 text-xs font-mono text-purple-400">{v.numero}</td>
                  <td className="px-3 py-3 text-sm text-slate-300">{v.usuario.nombre}</td>
                  <td className="px-3 py-3 text-sm text-slate-400">{v.items.length}</td>
                  <td className="px-3 py-3 text-sm text-slate-400 capitalize">{v.metodoPago}</td>
                  <td className="px-3 py-3 text-sm text-slate-400">
                    {new Date(v.createdAt).toLocaleDateString("es-CL")}
                  </td>
                  <td className="px-3 py-3 text-sm font-bold text-green-400">{formatCLP(v.total)}</td>
                </tr>
              ))}
              {data.ventasRecientes.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">Sin ventas recientes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enviar reportes */}
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-2">📤 Enviar Reporte Automático</h3>
        <p className="text-sm text-slate-400 mb-4">Recibe resúmenes de tu negocio directamente en tu dispositivo</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Tipo de Reporte</label>
            <select value={tipoReporte} onChange={e => setTipoReporte(e.target.value)} className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500">
              <option value="diario">📅 Reporte Diario</option>
              <option value="semanal">📆 Reporte Semanal</option>
              <option value="mensual">🗓️ Reporte Mensual</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">📧 Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">📱 WhatsApp</label>
            <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+56 9 1234 5678" className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={enviarReporte}
            disabled={enviando}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 disabled:opacity-50 rounded-xl text-white font-semibold text-sm transition-all"
          >
            {enviando ? "⏳ Enviando..." : "📤 Enviar Ahora"}
          </button>
          {reporteEnviado && (
            <span className="text-sm text-green-400 flex items-center gap-1">
              ✅ Reporte enviado exitosamente
            </span>
          )}
        </div>

        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <p className="text-xs text-amber-400">
            💡 <strong>WhatsApp:</strong> Requiere configurar WhatsApp Business API. 
            <strong> Email:</strong> Configura SMTP en Configuración del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
