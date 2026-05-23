"use client";
import { useState, useEffect } from "react";

interface Config {
  id: number;
  nombre: string;
  rut: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  whatsapp: string | null;
  moneda: string;
  reporteEmail: boolean;
  reporteWhats: boolean;
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [form, setForm] = useState({
    nombre: "", rut: "", direccion: "", telefono: "", email: "", whatsapp: "", moneda: "CLP",
    reporteEmail: false, reporteWhats: false,
    smtpHost: "", smtpPort: "587", smtpUser: "", smtpPass: "",
  });
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch("/api/configuracion").then(r => r.json()).then(c => {
      if (c) {
        setConfig(c);
        setForm(prev => ({ ...prev, ...c, smtpHost: "", smtpPort: "587", smtpUser: "", smtpPass: "" }));
      }
    }).catch(() => {});
  }, []);

  const guardar = async () => {
    await fetch("/api/configuracion", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => {});
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  return (
    <div className="p-6 fade-in space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">⚙️ Configuración</h1>
        <p className="text-slate-400 text-sm mt-1">Ajustes del sistema y del local</p>
      </div>

      {/* Datos del local */}
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4">🏪 Datos del Local</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "nombre", label: "Nombre del Local *", placeholder: "BOTELLAPP Licorería", colSpan: true },
            { key: "rut", label: "RUT", placeholder: "12.345.678-9", colSpan: false },
            { key: "telefono", label: "Teléfono", placeholder: "+56 9 1234 5678", colSpan: false },
            { key: "email", label: "Email", placeholder: "info@tu-local.cl", colSpan: false },
            { key: "whatsapp", label: "WhatsApp", placeholder: "+56987654321", colSpan: false },
            { key: "direccion", label: "Dirección", placeholder: "Av. Principal 123, Santiago", colSpan: true },
          ].map(f => (
            <div key={f.key} className={f.colSpan ? "col-span-2" : ""}>
              <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
              <input
                value={(form as Record<string,string | boolean>)[f.key] as string}
                onChange={e => setForm({...form, [f.key]: e.target.value})}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Reportes automáticos */}
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4">📤 Reportes Automáticos</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#0f1117] rounded-xl">
            <div>
              <p className="text-sm text-white font-medium">📧 Reportes por Email</p>
              <p className="text-xs text-slate-500 mt-0.5">Envío automático de reportes diarios por correo</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={form.reporteEmail}
                onChange={e => setForm({...form, reporteEmail: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#2d3148] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0f1117] rounded-xl">
            <div>
              <p className="text-sm text-white font-medium">📱 Reportes por WhatsApp</p>
              <p className="text-xs text-slate-500 mt-0.5">Resúmenes diarios por WhatsApp Business</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={form.reporteWhats}
                onChange={e => setForm({...form, reporteWhats: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#2d3148] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
          </div>
        </div>
      </div>

      {/* Config SMTP */}
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-2">📬 Configuración SMTP</h2>
        <p className="text-xs text-slate-500 mb-4">Para envío de reportes por email (Gmail, Outlook, etc.)</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Servidor SMTP</label>
            <input value={form.smtpHost} onChange={e => setForm({...form, smtpHost: e.target.value})} placeholder="smtp.gmail.com" className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Puerto</label>
            <input value={form.smtpPort} onChange={e => setForm({...form, smtpPort: e.target.value})} placeholder="587" className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Usuario</label>
            <input type="email" value={form.smtpUser} onChange={e => setForm({...form, smtpUser: e.target.value})} placeholder="tu@gmail.com" className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Contraseña de App</label>
            <input type="password" value={form.smtpPass} onChange={e => setForm({...form, smtpPass: e.target.value})} placeholder="••••••••••••" className="w-full px-3 py-2 bg-[#0f1117] border border-[#2d3148] rounded-lg text-slate-200 text-sm focus:outline-none focus:border-purple-500" />
          </div>
        </div>
      </div>

      {/* Credenciales del sistema */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
        <h2 className="font-semibold text-amber-400 mb-3">🔐 Credenciales de Acceso Demo</h2>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { rol: "Admin", email: "admin@botellapp.cl", pass: "admin123", color: "text-red-400" },
            { rol: "Propietario", email: "propietario@botellapp.cl", pass: "propietario123", color: "text-amber-400" },
            { rol: "Vendedor", email: "vendedor@botellapp.cl", pass: "vendedor123", color: "text-green-400" },
          ].map(c => (
            <div key={c.rol} className="bg-[#0f1117]/50 rounded-lg p-3">
              <p className={`font-bold ${c.color}`}>{c.rol}</p>
              <p className="text-slate-400 mt-1">{c.email}</p>
              <p className="text-slate-500 font-mono">{c.pass}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guardar */}
      <div className="flex items-center gap-4">
        <button
          onClick={guardar}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 rounded-xl text-white font-semibold text-sm transition-all"
        >
          💾 Guardar Configuración
        </button>
        {guardado && <span className="text-sm text-green-400">✅ Guardado exitosamente</span>}
      </div>
    </div>
  );
}
