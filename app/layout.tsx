import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BOTELLAPP - Sistema de Gestión de Licorería",
  description: "Sistema completo de gestión para botillerías y licorerías",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍷</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#0f1117] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
