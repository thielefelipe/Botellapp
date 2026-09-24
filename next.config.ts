import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Evita que Turbopack adivine mal la raíz del workspace cuando hay otro
  // package-lock.json en una carpeta por encima de este proyecto (pasa en
  // Windows si el perfil de usuario tiene otro proyecto de Node suelto).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
