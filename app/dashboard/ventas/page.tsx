"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCLP, formatDate } from "@/lib/utils";
import { enAppEscritorio } from "@/lib/electron-bridge";

interface Producto {
  id: number;
  codigo: string | null;
  nombre: string;
  precioVenta: number;
  stock: number;
  categoria: { nombre: string; color: string; icono: string } | null;
}

interface ItemCarrito {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  stock: number;
}

interface VentaCompletada {
  id: number;
  numero: string;
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: string;
  createdAt: string;
  usuario: { nombre: string };
  items: {
    cantidad: number;
    precio: number;
    subtotal: number;
    producto: { nombre: string; codigo: string | null };
  }[];
}

interface Configuracion {
  nombre: string;
  rut: string | null;
  direccion: string | null;
  telefono: string | null;
}

const METODOS_PAGO_LABEL: Record<string, string> = {
  efectivo: "Efectivo",
  debito: "Débito",
  credito: "Crédito",
  transferencia: "Transferencia",
};

const METODOS_PAGO = [
  { value: "efectivo", label: "💵 Efectivo" },
  { value: "debito", label: "💳 Débito" },
  { value: "credito", label: "💳 Crédito" },
  { value: "transferencia", label: "📱 Transferencia" },
];

export default function VentasPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todas");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [descuento, setDescuento] = useState(0);
  const [notas, setNotas] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState<VentaCompletada | null>(null);
  const [montoPagado, setMontoPagado] = useState<number>(0);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [escritorio, setEscritorio] = useState(false);

  useEffect(() => {
    // enAppEscritorio() solo puede evaluarse en el cliente (mira window.botellappDesktop)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEscritorio(enAppEscritorio());
  }, []);

  useEffect(() => {
    fetch("/api/productos")
      .then((r) => r.json())
      .then((data) => {
        setProductos(data);
        const cats = [...new Set(data.map((p: Producto) => p.categoria?.nombre).filter(Boolean))] as string[];
        setCategorias(cats);
      });
    fetch("/api/configuracion")
      .then((r) => r.json())
      .then(setConfiguracion)
      .catch(() => {});
  }, []);

  const productosFiltrados = productos.filter((p) => {
    const matchBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.codigo && p.codigo.toLowerCase().includes(busqueda.toLowerCase()));
    const matchCategoria =
      categoriaActiva === "todas" || p.categoria?.nombre === categoriaActiva;
    return matchBusqueda && matchCategoria && p.stock > 0;
  });

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existe = prev.find((i) => i.productoId === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) return prev;
        return prev.map((i) =>
          i.productoId === producto.id
            ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * i.precio }
            : i
        );
      }
      return [
        ...prev,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          precio: producto.precioVenta,
          cantidad: 1,
          subtotal: producto.precioVenta,
          stock: producto.stock,
        },
      ];
    });
  };

  const cambiarCantidad = (productoId: number, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((i) => {
          if (i.productoId !== productoId) return i;
          const nuevaCantidad = i.cantidad + delta;
          if (nuevaCantidad <= 0) return null;
          if (nuevaCantidad > i.stock) return i;
          return { ...i, cantidad: nuevaCantidad, subtotal: nuevaCantidad * i.precio };
        })
        .filter(Boolean) as ItemCarrito[]
    );
  };

  const subtotal = carrito.reduce((sum, i) => sum + i.subtotal, 0);
  const totalDescuento = subtotal * (descuento / 100);
  const total = subtotal - totalDescuento;
  const cambio = montoPagado > total ? montoPagado - total : 0;

  const procesarVenta = useCallback(async () => {
    if (carrito.length === 0) return;
    setProcesando(true);

    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: carrito.map((i) => ({
            productoId: i.productoId,
            cantidad: i.cantidad,
            precio: i.precio,
          })),
          metodoPago,
          // El backend espera el descuento como monto ($), no como porcentaje.
          descuento: totalDescuento,
          notas,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al procesar la venta");
        return;
      }

      const data = await res.json();
      setVentaCompletada(data.venta);
      setCarrito([]);
      setDescuento(0);
      setNotas("");
      setMontoPagado(0);

      // Refresh productos
      fetch("/api/productos")
        .then((r) => r.json())
        .then(setProductos);
    } finally {
      setProcesando(false);
    }
  }, [carrito, metodoPago, totalDescuento, notas]);

  const imprimir = useCallback(async () => {
    if (!ventaCompletada) return;

    if (!escritorio || !window.botellappDesktop) {
      window.print();
      return;
    }

    setImprimiendo(true);
    try {
      const resultado = await window.botellappDesktop.imprimirBoleta(ventaCompletada, configuracion);
      if (!resultado.ok) {
        alert(
          `No se pudo imprimir en la impresora térmica:\n${resultado.error}\n\nSe abrirá la impresión normal como respaldo.`
        );
        window.print();
      }
    } finally {
      setImprimiendo(false);
    }
  }, [ventaCompletada, configuracion, escritorio]);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Productos panel */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">💰 Ventas Rápidas</h1>
          <span className="text-xs text-slate-500 bg-[#1a1d27] px-3 py-1 rounded-full border border-[#2d3148]">
            {productos.filter((p) => p.stock > 0).length} productos disponibles
          </span>
        </div>

        {/* Búsqueda */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="🔍 Buscar producto o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#1a1d27] border border-[#2d3148] rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-thin">
          <button
            onClick={() => setCategoriaActiva("todas")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              categoriaActiva === "todas"
                ? "bg-purple-600 text-white"
                : "bg-[#1a1d27] border border-[#2d3148] text-slate-400 hover:text-white"
            }`}
          >
            🏪 Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                categoriaActiva === cat
                  ? "bg-purple-600 text-white"
                  : "bg-[#1a1d27] border border-[#2d3148] text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
            {productosFiltrados.map((producto) => {
              const enCarrito = carrito.find((i) => i.productoId === producto.id);
              return (
                <button
                  key={producto.id}
                  onClick={() => agregarAlCarrito(producto)}
                  className={`relative bg-[#1a1d27] border rounded-xl p-3 text-left hover:border-purple-500/50 hover:bg-purple-500/5 transition-all ${
                    enCarrito ? "border-purple-500/50 bg-purple-500/10" : "border-[#2d3148]"
                  }`}
                >
                  {enCarrito && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full text-xs text-white flex items-center justify-center font-bold">
                      {enCarrito.cantidad}
                    </span>
                  )}
                  <div className="text-2xl mb-2">{producto.categoria?.icono || "📦"}</div>
                  <p className="text-sm font-medium text-white leading-tight line-clamp-2 mb-1">{producto.nombre}</p>
                  {producto.codigo && (
                    <p className="text-xs text-slate-600 mb-1">{producto.codigo}</p>
                  )}
                  <p className="text-sm font-bold text-green-400">{formatCLP(producto.precioVenta)}</p>
                  <p className="text-xs text-slate-500">Stock: {producto.stock}</p>
                </button>
              );
            })}
          </div>
          {productosFiltrados.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <span className="text-4xl block mb-2">🔍</span>
              <p>No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {/* Carrito panel */}
      <div className="w-80 bg-[#13161f] border-l border-[#2d3148] flex flex-col">
        <div className="p-4 border-b border-[#2d3148]">
          <h2 className="font-bold text-white">🛒 Carrito</h2>
          <p className="text-xs text-slate-500">{carrito.length} productos</p>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
          {carrito.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <span className="text-4xl block mb-2">🛒</span>
              <p className="text-sm">Agrega productos para vender</p>
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.productoId} className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-3">
                <p className="text-sm text-white font-medium leading-tight mb-2">{item.nombre}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => cambiarCantidad(item.productoId, -1)}
                      className="w-7 h-7 rounded-lg bg-[#0f1117] border border-[#2d3148] text-slate-400 hover:text-white hover:border-red-500/50 transition-all text-sm font-bold"
                    >
                      −
                    </button>
                    <span className="text-white font-bold text-sm w-6 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(item.productoId, 1)}
                      className="w-7 h-7 rounded-lg bg-[#0f1117] border border-[#2d3148] text-slate-400 hover:text-white hover:border-green-500/50 transition-all text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-green-400 font-bold text-sm">{formatCLP(item.subtotal)}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{formatCLP(item.precio)} c/u</p>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="p-4 border-t border-[#2d3148] space-y-3">
          {/* Método de pago */}
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1d27] border border-[#2d3148] rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500"
          >
            {METODOS_PAGO.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {/* Descuento */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Descuento:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={descuento}
              onChange={(e) => setDescuento(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-[#1a1d27] border border-[#2d3148] rounded-lg text-slate-200 text-sm text-center focus:outline-none focus:border-purple-500"
            />
            <span className="text-sm text-slate-400">%</span>
          </div>

          {/* Monto pagado */}
          {metodoPago === "efectivo" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Pago:</span>
              <input
                type="number"
                min="0"
                value={montoPagado || ""}
                onChange={(e) => setMontoPagado(Number(e.target.value))}
                placeholder={String(total)}
                className="flex-1 px-2 py-1 bg-[#1a1d27] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          )}

          {/* Totales */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span>{formatCLP(subtotal)}</span>
            </div>
            {descuento > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Descuento ({descuento}%):</span>
                <span>−{formatCLP(totalDescuento)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-white border-t border-[#2d3148] pt-2">
              <span>TOTAL:</span>
              <span className="text-green-400">{formatCLP(total)}</span>
            </div>
            {cambio > 0 && (
              <div className="flex justify-between text-blue-400 font-semibold">
                <span>Cambio:</span>
                <span>{formatCLP(cambio)}</span>
              </div>
            )}
          </div>

          {/* Botón de venta */}
          <button
            onClick={procesarVenta}
            disabled={carrito.length === 0 || procesando}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all"
          >
            {procesando ? "⏳ Procesando..." : "✅ COBRAR"}
          </button>

          {carrito.length > 0 && (
            <button
              onClick={() => setCarrito([])}
              className="w-full py-2 text-sm text-slate-500 hover:text-red-400 transition-colors"
            >
              🗑️ Limpiar carrito
            </button>
          )}
        </div>
      </div>

      {/* Venta exitosa + boleta imprimible */}
      {ventaCompletada && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d27] border border-green-500/30 rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl">
            <div className="p-6 text-center border-b border-[#2d3148] no-print">
              <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="text-lg font-bold text-white">¡Venta registrada!</h2>
            </div>

            {/* Contenido de la boleta (esto es lo único que se imprime) */}
            <div id="boleta-print-area" className="p-6 bg-white text-black font-mono text-xs leading-relaxed">
              <div className="text-center mb-3">
                <p className="font-bold text-sm">{configuracion?.nombre || "BOTELLAPP"}</p>
                {configuracion?.direccion && <p>{configuracion.direccion}</p>}
                {configuracion?.rut && <p>RUT: {configuracion.rut}</p>}
                {configuracion?.telefono && <p>Tel: {configuracion.telefono}</p>}
              </div>
              <div className="border-t border-dashed border-black my-2" />
              <p className="text-center font-bold">BOLETA DE VENTA</p>
              <p className="text-center mb-2">N° {ventaCompletada.numero}</p>
              <p>Fecha: {formatDate(ventaCompletada.createdAt)}</p>
              <p>Cajero: {ventaCompletada.usuario.nombre}</p>
              <div className="border-t border-dashed border-black my-2" />
              {ventaCompletada.items.map((item, i) => (
                <div key={i} className="mb-1.5">
                  <p>{item.producto.nombre}</p>
                  <div className="flex justify-between">
                    <span>{item.cantidad} x {formatCLP(item.precio)}</span>
                    <span>{formatCLP(item.subtotal)}</span>
                  </div>
                </div>
              ))}
              <div className="border-t border-dashed border-black my-2" />
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCLP(ventaCompletada.subtotal)}</span>
              </div>
              {ventaCompletada.descuento > 0 && (
                <div className="flex justify-between">
                  <span>Descuento</span>
                  <span>-{formatCLP(ventaCompletada.descuento)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm mt-1">
                <span>TOTAL</span>
                <span>{formatCLP(ventaCompletada.total)}</span>
              </div>
              <p className="mt-1">
                Pago: {METODOS_PAGO_LABEL[ventaCompletada.metodoPago] || ventaCompletada.metodoPago}
              </p>
              <div className="border-t border-dashed border-black my-2" />
              <p className="text-center">¡Gracias por su compra!</p>
            </div>

            <div className="p-4 flex flex-col gap-2 no-print">
              <div className="flex gap-2">
                <button
                  onClick={imprimir}
                  disabled={imprimiendo}
                  className="flex-1 py-3 bg-[#0f1117] border border-[#2d3148] hover:border-purple-500/50 disabled:opacity-50 rounded-xl font-semibold text-white transition-colors text-sm"
                >
                  {imprimiendo ? "⏳ Imprimiendo..." : "🖨️ Imprimir boleta"}
                </button>
                {escritorio && (
                  <button
                    onClick={() => window.botellappDesktop?.abrirCajon()}
                    title="Abrir cajón portamonedas"
                    className="px-4 py-3 bg-[#0f1117] border border-[#2d3148] hover:border-purple-500/50 rounded-xl font-semibold text-white transition-colors text-sm"
                  >
                    🗄️
                  </button>
                )}
              </div>
              <button
                onClick={() => setVentaCompletada(null)}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-white transition-colors text-sm"
              >
                Nueva venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
