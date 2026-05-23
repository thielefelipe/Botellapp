"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
          <h2 className="text-xl font-semibold text-slate-200 mb-6">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="usuario@botellapp.cl"
                className="w-full px-4 py-3 bg-[#0f1117] border border-[#2d3148] rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
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
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 disabled:opacity-50 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
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

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-[#0f1117] rounded-xl border border-[#2d3148]">
            <p className="text-xs font-semibold text-slate-500 mb-3">CREDENCIALES DE DEMO</p>
            <div className="space-y-2">
              {[
                { rol: "Admin", email: "admin@botellapp.cl", pass: "admin123", color: "text-red-400" },
                { rol: "Propietario", email: "propietario@botellapp.cl", pass: "propietario123", color: "text-amber-400" },
                { rol: "Vendedor", email: "vendedor@botellapp.cl", pass: "vendedor123", color: "text-green-400" },
              ].map((cred) => (
                <button
                  key={cred.rol}
                  onClick={() => { setEmail(cred.email); setPassword(cred.pass); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#2d3148]/50 transition-colors text-left group"
                >
                  <span className={`text-xs font-medium ${cred.color}`}>{cred.rol}</span>
                  <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          BOTELLAPP © 2024 · Sistema de Gestión de Licorerías
        </p>
      </div>
    </div>
  );
}
