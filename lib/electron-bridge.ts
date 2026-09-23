// Puente opcional hacia la app de escritorio (Electron). En el navegador
// normal `window.botellappDesktop` no existe y todo cae a `window.print()`.

export interface ImpresionResultado {
  ok: boolean;
  error?: string;
}

declare global {
  interface Window {
    botellappDesktop?: {
      imprimirBoleta: (venta: unknown, configuracion: unknown) => Promise<ImpresionResultado>;
      abrirCajon: () => Promise<ImpresionResultado>;
    };
  }
}

export function enAppEscritorio(): boolean {
  return typeof window !== "undefined" && !!window.botellappDesktop;
}
