import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BOTELLAPP - Gestión de Licorería",
    short_name: "BOTELLAPP",
    description: "Sistema completo de gestión para botillerías y licorerías",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#0f1117",
    theme_color: "#7c3aed",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-72.svg", sizes: "72x72", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icons/icon-96.svg", sizes: "96x96", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icons/icon-128.svg", sizes: "128x128", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icons/icon-144.svg", sizes: "144x144", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icons/icon-152.svg", sizes: "152x152", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icons/icon-384.svg", sizes: "384x384", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Nueva Venta", url: "/dashboard/ventas", description: "Ir a ventas rápidas" },
      { name: "Ver Caja", url: "/dashboard/caja", description: "Ver balance de caja" },
      { name: "Inventario", url: "/dashboard/inventario", description: "Ver inventario" },
    ],
    categories: ["business", "finance", "productivity"],
  };
}
