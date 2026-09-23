/**
 * BOTELLAPP Desktop App - Electron Main Process
 * 
 * This app connects to your deployed BOTELLAPP server.
 * Change BOTELLAPP_URL to your Render deployment URL.
 */

const { app, BrowserWindow, Menu, Tray, nativeImage, shell, dialog, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const { imprimirBoleta, abrirCajon } = require("./impresora");

// ──────────────────────────────────────────────
// CONFIGURATION
// Change this to your deployed Render URL:
const BOTELLAPP_URL = process.env.BOTELLAPP_URL || "https://botellapp.onrender.com";
// For local development testing:
// const BOTELLAPP_URL = "http://localhost:3000";
// ──────────────────────────────────────────────

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 680,
    backgroundColor: "#0f1117",
    title: "BOTELLAPP",
    show: false, // Show when ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, "preload.js"),
    },
    // On Mac, use traffic lights style
    ...(process.platform === "darwin" ? {
      titleBarStyle: "hiddenInset",
      trafficLightPosition: { x: 16, y: 16 },
    } : {
      frame: true,
    }),
  });

  // Load the app
  mainWindow.loadURL(BOTELLAPP_URL);

  // Show when ready to avoid white flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (process.platform === "darwin") app.dock.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Handle connection errors
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("Load failed:", errorCode, errorDescription);
    mainWindow.loadURL(`data:text/html,
      <html style="background:#0f1117;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
        <div style="text-align:center;max-width:400px">
          <div style="font-size:48px;margin-bottom:16px">🔌</div>
          <h2 style="color:#f472b6">Sin conexión</h2>
          <p style="color:#94a3b8">No se pudo conectar a BOTELLAPP.</p>
          <p style="color:#64748b;font-size:13px">URL: ${BOTELLAPP_URL}</p>
          <button onclick="window.location.reload()" 
            style="margin-top:16px;padding:12px 24px;background:linear-gradient(to right,#7c3aed,#d97706);border:none;border-radius:12px;color:white;font-size:16px;cursor:pointer;font-weight:bold">
            🔄 Reintentar
          </button>
        </div>
      </html>`);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray() {
  // Simple tray icon
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: "Abrir BOTELLAPP", click: () => mainWindow?.show() },
    { type: "separator" },
    { label: "Versión " + app.getVersion(), enabled: false },
    { type: "separator" },
    { label: "Salir", role: "quit" },
  ]);
  
  tray.setToolTip("BOTELLAPP");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => mainWindow?.show());
}

function createAppMenu() {
  const template = [
    {
      label: "BOTELLAPP",
      submenu: [
        { label: "Acerca de BOTELLAPP", role: "about" },
        { type: "separator" },
        { label: "Salir", role: "quit" },
      ],
    },
    {
      label: "Ver",
      submenu: [
        { label: "Recargar", accelerator: "CmdOrCtrl+R", click: () => mainWindow?.reload() },
        { label: "Pantalla Completa", role: "togglefullscreen" },
        { type: "separator" },
        { label: "Zoom +", role: "zoomIn" },
        { label: "Zoom -", role: "zoomOut" },
        { label: "Zoom Normal", role: "resetZoom" },
      ],
    },
    {
      label: "Navegación",
      submenu: [
        { label: "🏠 Inicio", click: () => mainWindow?.loadURL(BOTELLAPP_URL + "/dashboard") },
        { label: "💰 Ventas", click: () => mainWindow?.loadURL(BOTELLAPP_URL + "/dashboard/ventas") },
        { label: "📦 Inventario", click: () => mainWindow?.loadURL(BOTELLAPP_URL + "/dashboard/inventario") },
        { label: "🏦 Caja", click: () => mainWindow?.loadURL(BOTELLAPP_URL + "/dashboard/caja") },
        { type: "separator" },
        { label: "📈 Reportes", click: () => mainWindow?.loadURL(BOTELLAPP_URL + "/dashboard/reportes") },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC: impresión térmica (ver src/impresora.js)
ipcMain.handle("imprimir-boleta", async (event, { venta, configuracion }) => {
  return imprimirBoleta(venta, configuracion);
});

ipcMain.handle("abrir-cajon", async () => {
  return abrirCajon();
});

// App Events
app.whenReady().then(() => {
  createWindow();
  createAppMenu();
  // createTray(); // Uncomment to enable system tray

  // Auto-updater (requires GitHub releases)
  if (process.env.NODE_ENV !== "development") {
    autoUpdater.checkForUpdatesAndNotify();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else mainWindow?.show();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Auto-updater events
autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Actualización disponible",
    message: "Nueva versión de BOTELLAPP disponible. Descargando...",
    buttons: ["OK"],
  });
});

autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Actualización lista",
    message: "La actualización será instalada al reiniciar BOTELLAPP.",
    buttons: ["Reiniciar ahora", "Después"],
  }).then((result) => {
    if (result.response === 0) autoUpdater.quitAndInstall();
  });
});
