# BOTELLAPP Desktop App

App de escritorio para Windows, Mac y Linux.

## 🚀 Inicio Rápido

```bash
cd electron
npm install
npm start
```

## ⚙️ Configurar URL del servidor

Edita `src/main.js` línea 14:

```javascript
const BOTELLAPP_URL = "https://TU-APP.onrender.com";
```

## 📦 Compilar distribuibles

```bash
# Windows (.exe installer)
npm run build:win

# Mac (.dmg)
npm run build:mac

# Linux (.AppImage y .deb)
npm run build:linux

# Todas las plataformas
npm run build
```

Los archivos quedan en `electron/dist/`.

## 🔄 Actualizaciones automáticas

La app puede actualizar automáticamente desde GitHub Releases.
Configura en `package.json`:
```json
"publish": {
  "provider": "github",
  "owner": "tu-usuario",
  "repo": "botellapp"
}
```

## 🖨️ Impresora térmica (boleta ESC/POS)

La app de escritorio puede imprimir la boleta directo en una impresora
térmica (sin el diálogo de impresión del navegador). Se configura con
variables de entorno antes de iniciar la app:

```bash
# Impresora en red (recomendado, no requiere drivers ni recompilar nada)
THERMAL_PRINTER_INTERFACE="tcp://192.168.0.99:9100" npm start

# Impresora instalada en el sistema operativo (USB), por nombre exacto
THERMAL_PRINTER_INTERFACE="printer:Nombre de la impresora" npm start

# O dejar que intente detectar la predeterminada del sistema
npm start   # equivale a THERMAL_PRINTER_INTERFACE="printer:auto"
```

Otras variables opcionales:
- `THERMAL_PRINTER_TYPE` — `epson` (default), `star`, `tanca`, `daruma`, `brother`
- `THERMAL_PRINTER_WIDTH` — caracteres por línea (default `48`, típico para
  papel de 80mm; usa `32` para papel de 58mm)

Si usas la interfaz `printer:` (impresora USB instalada por el sistema),
esa parte de la librería depende de un módulo nativo — si falla al
instalar o al imprimir, puede que necesites recompilarlo para Electron con
`npx electron-rebuild`. La interfaz `tcp://` es JavaScript puro y no tiene
ese problema — si tu impresora soporta red, es la opción más simple para
empezar a probar.

Si no hay impresora térmica conectada o falla la conexión, el botón
"Imprimir boleta" en la app cae de vuelta al diálogo de impresión normal
del navegador (igual que en la versión web).

## 💡 Atajos de teclado

| Atajo | Función |
|-------|---------|
| Ctrl+R | Recargar |
| F11 | Pantalla completa |
| Ctrl++ | Zoom in |
| Ctrl+- | Zoom out |

## 📋 Requisitos para compilar

- **Windows**: No requiere nada extra
- **Mac**: Requiere Xcode Command Line Tools
- **Linux**: Requiere `fakeroot` y `dpkg` para .deb
