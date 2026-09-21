"use client";
import { useState, useEffect } from "react";
import { formatCLP, formatDate } from "@/lib/utils";

interface Proveedor { id: number; nombre: string; }
interface Producto { id: number; nombre: string; codigo: string | null; precioCompra: number; }
interface ItemCompra { productoId: number; nombre: string; cantidad: number; precio: number; }

interface Compra {
  id: number;
  numero: string;
  total: number;
  estado: string;
  fechaCompra: string;
  proveedor: { nombre: string };
  items: { cantidad: number; precio: number; producto: { nombre: string } }[];
}

export default function ComprasPage() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proveedorId, setProveedorId] = useState("");
  const [items, setItems] = useState<ItemCompra[]>([]);
  const [notas, setNotas] = useState("");
  const [prodSelec, setProdSelec] = useState("");
  const [cantSelec, setCantSelec] = useState(1);
  const [precioSelec, setPrecioSelec] = useState(0);

  const cargar = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/compras").then(r => r.json()),
      fetch("/api/proveedores").then(r => r.json()),
      fetch("/api/productos").then(r => r.json()),
    ]).then(([c, p, pr]) => { setCompras(c); setProveedores(p); setProductos(pr); setLoading(false); });
  };

  useEffect(() => {
    // patrón estándar de fetch-on-mount; cargar() también se reusa para refetch tras crear
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, []);

  const agregarItem = () => {
    if (!prodSelec) return;
    const prod = productos.find(p => String(p.id) === prodSelec);
    if (!prod) return;
    setItems(prev => {
      const existe = prev.find(i => String(i.productoId) === prodSelec);
      if (existe) return prev.map(i => String(i.productoId) === prodSelec ? {...i, cantidad: i.cantidad + cantSelec} : i);
      return [...prev, { productoId: prod.id, nombre: prod.nombre, cantidad: cantSelec, precio: precioSelec || prod.precioCompra }];
    });
    setProdSelec(""); setCantSelec(1); setPrecioSelec(0);
  };

  const total = items.reduce((s, i) => s + i.cantidad * i.precio, 0);

  const guardar = async () => {
    if (!proveedorId || items.length === 0) { alert("Complete todos los campos"); return; }
    await fetch("/api/compras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proveedorId: Number(proveedorId), items: items.map(i => ({...i, subtotal: i.cantidad * i.precio})), notas }),
    });
    setShowModal(false);
    setItems([]); setProveedorId(""); setNotas("");
    cargar();
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🛒 Compras</h1>
          <p className="text-slate-400 text-sm mt-1">{compras.length} compras registradas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-medium transition-colors">
          + Nueva Compra
        </button>
      </div>

      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2d3148]">
              {["N° Compra", "Proveedor", "Productos", "Fecha", "Estado", "Total"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-500">Cargando...</td></tr>
            ) : compras.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-500">
                <span className="text-4xl block mb-2">🛒</span><p>No hay compras registradas</p>
              </td></tr>
            ) : compras.map(c => (
              <tr key={c.id} className="border-b border-[#2d3148]/50 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-purple-400">{c.numero}</td>
                <td className="px-4 py-3 text-sm text-white">{c.proveedor.nombre}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{c.items.length} productos</td>
                <td className="px-4 py-3 text-sm text-slate-400">{formatDate(c.fechaCompra)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">{c.estado}</span>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-red-400">{formatCLP(c.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-5">🛒 Nueva Compra</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Proveedor *</label>
                <select value={proveedorId} onChange={e => setProveedorId(e.target.value)} className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500">
                  <option value="">Seleccionar proveedor...</option>
                  {proveedores.map(p => <option key={p.id} value={String(p.id)}>{p.nombre}</option>)}
                </select>
              </div>

              <div className="bg-[#0f1117] border border-[#2d3148] rounded-xl p-4">
                <p className="text-xs text-slate-400 font-semibold mb-3">AGREGAR PRODUCTOS</p>
                <div className="flex gap-2">
                  <select value={prodSelec} onChange={e => { setProdSelec(e.target.value); const p = productos.find(p => String(p.id) === e.target.value); setPrecioSelec(p?.precioCompra || 0); }} className="flex-1 px-3 py-2 bg-[#1a1d27] border border-[#2d3148] rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500">
                    <option value="">Seleccionar producto...</option>
                    {productos.map(p => <option key={p.id} value={String(p.id)}>{p.nombre}</option>)}
                  </select>
                  <input type="number" value={cantSelec} min="1" onChange={e => setCantSelec(Number(e.target.value))} placeholder="Cant." className="w-16 px-2 py-2 bg-[#1a1d27] border border-[#2d3148] rounded-lg text-slate-200 text-xs text-center focus:outline-none focus:border-purple-500" />
                  <input type="number" value={precioSelec} onChange={e => setPrecioSelec(Number(e.target.value))} placeholder="Precio" className="w-24 px-2 py-2 bg-[#1a1d27] border border-[#2d3148] rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500" />
                  <button onClick={agregarItem} className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-xs font-semibold transition-colors">+</button>
                </div>
              </div>

              {items.length > 0 && (
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#0f1117] border border-[#2d3148] rounded-lg p-3">
                      <span className="text-sm text-white">{item.nombre}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{item.cantidad} × {formatCLP(item.precio)}</span>
                        <span className="text-sm font-bold text-amber-400">{formatCLP(item.cantidad * item.precio)}</span>
                        <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#2d3148]">
                    <span>TOTAL:</span>
                    <span className="text-amber-400">{formatCLP(total)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1">Notas</label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2} className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm resize-none focus:outline-none focus:border-purple-500" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-[#0f1117] border border-[#2d3148] rounded-xl text-slate-400 text-sm">Cancelar</button>
              <button onClick={guardar} className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold text-sm">Registrar Compra</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
