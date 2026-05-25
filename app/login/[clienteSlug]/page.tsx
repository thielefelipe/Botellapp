"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface Negocio {
  id: number;
  nombre: string;
  slug: string;
}

interface ClienteInfo {
  id: number;
  nombre: string;
  slug: string;
}

export default function LoginClientePage({
  params,
}: {
  params: Promise<{ clienteSlug: string }>;
}) {
  const { clienteSlug } = use(params);
  const router = useRouter();

  const [cliente, setCliente] = useState<ClienteInfo | null>(null);
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [negocioId, setNegocioId] = useState<number | "">("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingNegocios, setLoadingNegocios] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchNegocios() {
      try {
        const res = await fetch(`/api/negocios?clienteSlug=${clienteSlug}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setCliente(data.cliente);
        setNegocios(data.negocios);
        // Si solo hay un negocio, lo seleccionamos automáticamente
        if (data.negocios.length === 1) {
          setNegocioId(data.negocios[0].id);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoadingNegocios(false);
      }
    }
    fetchNegocios();
  }, [clienteSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!negocioId) {
      setError("Por favor selecciona un negocio");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocioId, username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingNegocios) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#141824] to-[#0f1117] flex items-center justify-center">
        <div className="text-slate-400 flex items-center gap-3">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
          </svg>
          Cargando...
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#141824] to-[#0f1117] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-slate-200 mb-2">Negocio no encontrado</h1>
          <p className="text-slate-400 mb-6">
            El enlace de acceso no es válido o ha sido desactivado.
          </p>
          <p className="text-slate-600 text-sm">
            Contacta a tu administrador para obtener el enlace correcto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#141824] to-[#0f1117] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-amber-600 rounded-2xl shadow-2xl mb-4">
            <span className="text-4xl">🍷</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
            BOTELLAPP
          </h1>
          {cliente && (
            <p className="text-slate-300 mt-1 text-sm font-medium">{cliente.nombre}</p>
          )}
        </div>

        {/* Card */}
        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-slate-200 mb-6">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Selector de Negocio */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                🏪 Negocio
              </label>
              {negocios.length === 1 ? (
                // Si solo hay un negocio, mostrarlo como texto fijo
                <div className="w-full px-4 py-3 bg-[#0f1117] border border-[#2d3148] rounded-xl text-slate-200">
                  {negocios[0].nombre}
                </div>
              ) : (
                <select
                  value={negocioId}
                  onChange={(e) => setNegocioId(e.target.value ? Number(e.target.value) : "")}
                  required
                  className="w-full px-4 py-3 bg-[#0f1117] border border-[#2d3148] rounded-xl text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecciona tu negocio...</option>
                  {negocios.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                👤 Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Tu nombre de usuario"
                autoComplete="username"
                className="w-full px-4 py-3 bg-[#0f1117] border border-[#2d3148] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                🔒 Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-[#0f1117] border border-[#2d3148] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <span className="text-red-400 text-sm">⚠️ {error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !negocioId}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          BOTELLAPP © 2025 · Sistema de Gestión de Licorerías
        </p>
      </div>
    </div>
  );
}
