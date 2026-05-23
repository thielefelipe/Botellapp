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
