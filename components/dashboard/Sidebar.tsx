"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { href: "/dashboard", icon: "📊", label: "Dashboard", exact: true },
  { href: "/dashboard/ventas", icon: "💰", label: "Ventas Rápidas" },
  { href: "/dashboard/inventario", icon: "📦", label: "Inventario" },
  { href: "/dashboard/compras", icon: "🛒", label: "Compras" },
  { href: "/dashboard/proveedores", icon: "🏭", label: "Proveedores" },
  { href: "/dashboard/caja", icon: "🏦", label: "Caja" },
  { href: "/dashboard/reportes", icon: "📈", label: "Reportes" },
  { href: "/dashboard/configuracion", icon: "⚙️", label: "Configuración" },
];

interface SidebarProps {
  usuario: { nombre: string; rol: string; username: string; negocioNombre: string };
}

export default function Sidebar({ usuario }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (item: typeof menuItems[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const rolColor = {
    ADMIN: "bg-red-500/20 text-red-400 border-red-500/30",
    PROPIETARIO: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    VENDEDOR: "bg-green-500/20 text-green-400 border-green-500/30",
  }[usuario.rol] || "bg-slate-500/20 text-slate-400";

  const rolLabel = { ADMIN: "Admin", PROPIETARIO: "Propietario", VENDEDOR: "Vendedor" }[usuario.rol] || usuario.rol;

  return (
    <aside className="w-64 min-h-screen bg-[#13161f] border-r border-[#2d3148] flex flex-col">
      {/* Logo + Negocio */}
      <div className="p-6 border-b border-[#2d3148]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">🍷</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white text-lg leading-none">BOTELLAPP</h1>
            <p className="text-slate-400 text-xs truncate" title={usuario.negocioNombre}>
              🏪 {usuario.negocioNombre}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 group ${
              isActive(item)
                ? "bg-gradient-to-r from-purple-600/30 to-amber-600/20 text-white border border-purple-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
            {isActive(item) && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
            )}
          </Link>
        ))}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-[#2d3148]">
        <div className="bg-[#1a1d27] rounded-xl p-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
              {usuario.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{usuario.nombre}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${rolColor}`}>
                  {rolLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
        >
          <span>🚪</span>
          <span>{loggingOut ? "Saliendo..." : "Cerrar Sesión"}</span>
        </button>
      </div>
    </aside>
  );
}
