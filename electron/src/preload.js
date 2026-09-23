/**
 * Preload script: única puerta de entrada que el contenido web (la app de
 * Next.js cargada en el BrowserWindow) tiene hacia el proceso principal.
 * Con contextIsolation activado, nada de Node/Electron queda expuesto
 * salvo lo que declaramos explícitamente acá.
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("botellappDesktop", {
  imprimirBoleta: (venta, configuracion) =>
    ipcRenderer.invoke("imprimir-boleta", { venta, configuracion }),
  abrirCajon: () => ipcRenderer.invoke("abrir-cajon"),
});
