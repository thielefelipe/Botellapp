"use client";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

interface Proveedor {
  id: number;
  nombre: string;
  rut: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  activo: boolean;
  createdAt: string;
  _count?: { compras: number };
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", rut: "", telefono: "", email: "", direccion: "" });

  const cargar = () => {
    setLoading(true);
    fetch("/api/proveedores")
      .then(r => r.json())
      .then(data => { setProveedores(data); setLoading(false); });
  };

  useEffect(() => {
    // patrón estándar de fetch-on-mount; cargar() también se reusa para refetch tras crear/editar
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, []);

  const guardar = async () => {
    await fetch("/api/proveedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setForm({ nombre: "", rut: "", telefono: "", email: "", direccion: "" });
    cargar();
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🏭 Proveedores</h1>
          <p className="text-slate-400 text-sm mt-1">{proveedores.length} proveedores activos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-medium transition-colors">
          + Nuevo Proveedor
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {proveedores.map(p => (
            <div key={p.id} className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-5 hover:border-purple-500/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-amber-600/30 border border-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl">🏭</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{p.nombre}</h3>
                  {p.rut && <p className="text-xs text-slate-500 mt-0.5">RUT: {p.rut}</p>}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {p.telefono && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>📞</span> <span>{p.telefono}</span>
                  </div>
                )}
                {p.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>📧</span> <span className="truncate">{p.email}</span>
                  </div>
                )}
                {p.direccion && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>📍</span> <span className="truncate">{p.direccion}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-[#2d3148] flex items-center justify-between">
                <span className="text-xs text-slate-600">Desde {formatDate(p.createdAt)}</span>
                <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-full">
                  Activo
                </span>
              </div>
            </div>
          ))}
          {proveedores.length === 0 && (
            <div className="col-span-3 text-center py-12 text-slate-500">
              <span className="text-4xl block mb-2">🏭</span>
              <p>No hay proveedores registrados</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5">➕ Nuevo Proveedor</h2>
            <div className="space-y-3">
              {[
                { key: "nombre", label: "Nombre *", placeholder: "Distribuidora Ejemplo" },
                { key: "rut", label: "RUT", placeholder: "76.123.456-7" },
                { key: "telefono", label: "Teléfono", placeholder: "+56 9 1234 5678" },
                { key: "email", label: "Email", placeholder: "ventas@ejemplo.cl" },
                { key: "direccion", label: "Dirección", placeholder: "Av. Principal 123" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                  <input
                    value={(form as Record<string,string>)[f.key]}
                    onChange={e => setForm({...form, [f.key]: e.target.value})}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-[#0f1117] border border-[#2d3148] rounded-xl text-slate-400 text-sm">Cancelar</button>
              <button onClick={guardar} className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold text-sm">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
