"use client";

import { useState, useEffect } from "react";
import { formatCLP, formatDate } from "@/lib/utils";

interface Movimiento {
  id: number;
  tipo: string;
  categoria: string;
  descripcion: string;
  monto: number;
  metodoPago: string;
  fecha: string;
  usuario: { nombre: string };
}

const CATEGORIAS_INGRESO = ["Venta", "Abono", "Otro ingreso"];
const CATEGORIAS_EGRESO = ["Compra de mercadería", "Gastos operacionales", "Servicios", "Sueldos", "Otro egreso"];

export default function CajaPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [balance, setBalance] = useState(0);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    tipo: "ingreso", categoria: "Otro ingreso", descripcion: "", monto: 0, metodoPago: "efectivo"
  });

  const cargar = (tipo?: string) => {
    setLoading(true);
    const params = tipo && tipo !== "todos" ? `?tipo=${tipo}` : "";
    fetch(`/api/caja${params}`)
      .then(r => r.json())
      .then(data => {
        setMovimientos(data.movimientos || []);
        setBalance(data.balance || 0);
        setTotalIngresos(data.totalIngresos || 0);
        setTotalEgresos(data.totalEgresos || 0);
        setLoading(false);
      });
  };

  useEffect(() => cargar(filtroTipo), [filtroTipo]);

  const categorias = form.tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO;

  const guardar = async () => {
    await fetch("/api/caja", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, monto: Number(form.monto) }),
    });
    setShowModal(false);
    cargar(filtroTipo);
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🏦 Caja</h1>
          <p className="text-slate-400 text-sm mt-1">Control de ingresos y egresos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-medium transition-colors">
          + Nuevo Movimiento
        </button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-500/30 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Total Ingresos</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{formatCLP(totalIngresos)}</p>
          <p className="text-xs text-slate-500 mt-1">↑ Ventas + otros</p>
        </div>
        <div className="bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-500/30 rounded-2xl p-5">
          <p className="text-slate-400 text-sm">Total Egresos</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{formatCLP(totalEgresos)}</p>
          <p className="text-xs text-slate-500 mt-1">↓ Compras + gastos</p>
        </div>
        <div className={`bg-gradient-to-br rounded-2xl p-5 ${balance >= 0 ? 'from-blue-600/20 to-blue-600/5 border border-blue-500/30' : 'from-orange-600/20 to-orange-600/5 border border-orange-500/30'}`}>
          <p className="text-slate-400 text-sm">Balance Actual</p>
          <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>{formatCLP(balance)}</p>
          <p className="text-xs text-slate-500 mt-1">Ingresos - Egresos</p>
        </div>
      </div>

      {/* Filtro */}
      <div className="flex gap-2 mb-4">
        {[
          { value: "todos", label: "📋 Todos" },
          { value: "ingreso", label: "✅ Ingresos" },
          { value: "egreso", label: "❌ Egresos" },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFiltroTipo(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filtroTipo === f.value
                ? "bg-purple-600 text-white"
                : "bg-[#1a1d27] border border-[#2d3148] text-slate-400 hover:text-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla movimientos */}
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2d3148]">
              {["Tipo", "Descripción", "Categoría", "Método", "Fecha", "Monto"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-500">Cargando...</td></tr>
            ) : movimientos.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-500">
                <span className="text-4xl block mb-2">🏦</span>
                <p>No hay movimientos</p>
              </td></tr>
            ) : movimientos.map(m => (
              <tr key={m.id} className="border-b border-[#2d3148]/50 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                    m.tipo === "ingreso"
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }`}>
                    {m.tipo === "ingreso" ? "↑ Ingreso" : "↓ Egreso"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-white">{m.descripcion}</p>
                  <p className="text-xs text-slate-500">{m.usuario.nombre}</p>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">{m.categoria}</td>
                <td className="px-4 py-3 text-sm text-slate-400 capitalize">{m.metodoPago}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{formatDate(m.fecha)}</td>
                <td className={`px-4 py-3 text-sm font-bold ${m.tipo === "ingreso" ? "text-green-400" : "text-red-400"}`}>
                  {m.tipo === "ingreso" ? "+" : "−"}{formatCLP(m.monto)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5">➕ Nuevo Movimiento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Tipo</label>
                <div className="flex gap-3">
                  {["ingreso", "egreso"].map(t => (
                    <button
                      key={t}
                      onClick={() => setForm({...form, tipo: t, categoria: t === "ingreso" ? CATEGORIAS_INGRESO[0] : CATEGORIAS_EGRESO[0]})}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                        form.tipo === t
                          ? t === "ingreso" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                          : "bg-[#0f1117] border border-[#2d3148] text-slate-400"
                      }`}
                    >
                      {t === "ingreso" ? "↑ Ingreso" : "↓ Egreso"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Categoría</label>
                <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500">
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Descripción *</label>
                <input value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} required className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Monto *</label>
                  <input type="number" value={form.monto} onChange={e => setForm({...form, monto: Number(e.target.value)})} required className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Método Pago</label>
                  <select value={form.metodoPago} onChange={e => setForm({...form, metodoPago: e.target.value})} className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500">
                    <option value="efectivo">Efectivo</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-[#0f1117] border border-[#2d3148] rounded-xl text-slate-400 hover:text-white transition-colors text-sm">
                Cancelar
              </button>
              <button onClick={guardar} className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold text-sm transition-colors">
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
