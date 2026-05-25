"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [clienteSlug, setClienteSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteSlug.trim()) return;

    setLoading(true);
    setError("");

    // Verificar que el cliente existe antes de redirigir
    try {
      const slug = clienteSlug.trim().toLowerCase().replace(/\s+/g, "-");
      const res = await fetch(`/api/negocios?clienteSlug=${slug}`);
      if (res.status === 404) {
        setError("No encontramos ese negocio. Verifica el acceso con tu administrador.");
        return;
      }
      router.push(`/login/${slug}`);
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
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
          <p className="text-slate-400 mt-1 text-sm">Sistema de Gestión de Licorería</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Acceder al Sistema</h2>
          <p className="text-slate-500 text-sm mb-6">
            Ingresa el nombre de tu negocio para continuar
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                🏪 Nombre del Negocio
              </label>
              <input
                type="text"
                value={clienteSlug}
                onChange={(e) => setClienteSlug(e.target.value)}
                required
                placeholder="ej: rincon-patrimonial"
                className="w-full px-4 py-3 bg-[#0f1117] border border-[#2d3148] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
              <p className="text-slate-600 text-xs mt-2">
                Este enlace te lo proporciona tu administrador
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <span className="text-red-400 text-sm">⚠️ {error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !clienteSlug.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                  </svg>
                  Buscando...
                </span>
              ) : (
                "Continuar →"
              )}
            </button>
          </form>

          {/* Info box */}
          <div className="mt-6 p-4 bg-[#0f1117] rounded-xl border border-[#2d3148]">
            <p className="text-xs font-semibold text-slate-500 mb-2">💡 ¿Cómo accedo?</p>
            <p className="text-xs text-slate-600">
              Tu acceso directo es:{" "}
              <span className="text-purple-400 font-mono">botellapp.vercel.app/login/<span className="text-amber-400">tu-negocio</span></span>
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Consulta este enlace con tu administrador de BOTELLAPP.
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          BOTELLAPP © 2025 · Sistema de Gestión de Licorerías
        </p>
      </div>
    </div>
  );
}
