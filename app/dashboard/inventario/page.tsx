"use client";

import { useState, useEffect } from "react";
import { formatCLP } from "@/lib/utils";

interface Producto {
  id: number;
  codigo: string | null;
  nombre: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  unidad: string;
  activo: boolean;
  categoria: { id: number; nombre: string; color: string; icono: string } | null;
}

interface Categoria {
  id: number;
  nombre: string;
  color: string;
  icono: string;
}

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    codigo: "", nombre: "", descripcion: "", precioCompra: 0, precioVenta: 0,
    stock: 0, stockMinimo: 5, unidad: "unidad", categoriaId: ""
  });

  const cargar = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/productos").then(r => r.json()),
      fetch("/api/categorias").then(r => r.json()),
    ]).then(([prods, cats]) => {
      setProductos(prods);
      setCategorias(cats);
      setLoading(false);
    });
  };

  useEffect(cargar, []);

  const productosFiltrados = productos.filter(p => {
    const matchBusq = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.codigo && p.codigo.toLowerCase().includes(busqueda.toLowerCase()));
    const matchCat = categoriaFiltro === "todas" || String(p.categoria?.id) === categoriaFiltro;
    return matchBusq && matchCat;
  });

  const abrirCrear = () => {
    setEditando(null);
    setForm({ codigo: "", nombre: "", descripcion: "", precioCompra: 0, precioVenta: 0, stock: 0, stockMinimo: 5, unidad: "unidad", categoriaId: "" });
    setShowModal(true);
  };

  const abrirEditar = (p: Producto) => {
    setEditando(p);
    setForm({
      codigo: p.codigo || "", nombre: p.nombre, descripcion: "",
      precioCompra: p.precioCompra, precioVenta: p.precioVenta,
      stock: p.stock, stockMinimo: p.stockMinimo, unidad: p.unidad,
      categoriaId: String(p.categoria?.id || "")
    });
    setShowModal(true);
  };

  const guardar = async () => {
    const body = {
      ...form,
      precioCompra: Number(form.precioCompra),
      precioVenta: Number(form.precioVenta),
      stock: Number(form.stock),
      stockMinimo: Number(form.stockMinimo),
      categoriaId: form.categoriaId ? Number(form.categoriaId) : undefined,
    };

    const url = editando ? `/api/productos/${editando.id}` : "/api/productos";
    const method = editando ? "PUT" : "POST";
    
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setShowModal(false);
    cargar();
  };

  const eliminar = async (id: number) => {
    if (!confirm("¿Desactivar este producto?")) return;
    await fetch(`/api/productos/${id}`, { method: "DELETE" });
    cargar();
  };

  const stockStatus = (p: Producto) => {
    if (p.stock <= 0) return { color: "text-red-400", bg: "bg-red-500/20 border-red-500/30", label: "Sin stock" };
    if (p.stock <= p.stockMinimo) return { color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/30", label: "Stock bajo" };
    return { color: "text-green-400", bg: "bg-green-500/20 border-green-500/30", label: "OK" };
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">📦 Inventario</h1>
          <p className="text-slate-400 text-sm mt-1">{productosFiltrados.length} productos</p>
        </div>
        <button onClick={abrirCrear} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-medium transition-colors">
          + Nuevo Producto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="🔍 Buscar..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-[#1a1d27] border border-[#2d3148] rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
        />
        <select
          value={categoriaFiltro}
          onChange={e => setCategoriaFiltro(e.target.value)}
          className="px-3 py-2 bg-[#1a1d27] border border-[#2d3148] rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={String(c.id)}>{c.icono} {c.nombre}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Cargando...</div>
      ) : (
        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2d3148]">
                {["Producto", "Categoría", "Precio Venta", "Precio Compra", "Stock", "Estado", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => {
                const status = stockStatus(p);
                return (
                  <tr key={p.id} className="border-b border-[#2d3148]/50 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#0f1117] flex items-center justify-center text-lg">
                          {p.categoria?.icono || "📦"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{p.nombre}</p>
                          {p.codigo && <p className="text-xs text-slate-500">{p.codigo}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-lg bg-[#0f1117] text-slate-400">
                        {p.categoria?.nombre || "Sin categoría"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-400">{formatCLP(p.precioVenta)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{formatCLP(p.precioCompra)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${status.color}`}>{p.stock}</span>
                      <span className="text-xs text-slate-600 ml-1">/ mín {p.stockMinimo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => abrirEditar(p)} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors">
                          ✏️
                        </button>
                        <button onClick={() => eliminar(p.id)} className="text-xs px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {productosFiltrados.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <span className="text-4xl block mb-2">📦</span>
              <p>No se encontraron productos</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5">
              {editando ? "✏️ Editar Producto" : "➕ Nuevo Producto"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Código</label>
                <input value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} placeholder="V001" className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Categoría</label>
                <select value={form.categoriaId} onChange={e => setForm({...form, categoriaId: e.target.value})} className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500">
                  <option value="">Sin categoría</option>
                  {categorias.map(c => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Precio Compra</label>
                <input type="number" value={form.precioCompra} onChange={e => setForm({...form, precioCompra: Number(e.target.value)})} className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Precio Venta *</label>
                <input type="number" value={form.precioVenta} onChange={e => setForm({...form, precioVenta: Number(e.target.value)})} required className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Stock Actual</label>
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Stock Mínimo</label>
                <input type="number" value={form.stockMinimo} onChange={e => setForm({...form, stockMinimo: Number(e.target.value)})} className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-[#0f1117] border border-[#2d3148] rounded-xl text-slate-400 hover:text-white transition-colors text-sm">
                Cancelar
              </button>
              <button onClick={guardar} className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold text-sm transition-colors">
                {editando ? "Guardar Cambios" : "Crear Producto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
