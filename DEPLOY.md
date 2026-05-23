# 🚀 Guía de Despliegue BOTELLAPP

## 📋 Opciones de acceso

| Plataforma | Método | Estado |
|-----------|--------|--------|
| 🌐 Web | Navegador → URL de Render | ✅ Listo |
| 🖥️ Windows | App Electron (.exe) | ✅ Listo |
| 🖥️ Mac | App Electron (.dmg) | ✅ Listo |
| 🖥️ Linux | App Electron (.AppImage) | ✅ Listo |
| 📱 Android | PWA o APK (Capacitor) | ✅ Listo |
| 📱 iPhone | PWA o IPA (Capacitor) | ✅ Listo |

---

## 1️⃣ Desplegar en Render (Web)

### Pasos:

**a) Crear cuenta en Render**
→ https://render.com (gratis)

**b) Conectar repositorio**
1. Dashboard → New → Blueprint
2. Conectar tu repositorio GitHub `thielefelipe/botellapp`
3. Render detecta automáticamente el `render.yaml`
4. Click **Apply**

**c) Render creará automáticamente:**
- ✅ Servidor web con Next.js
- ✅ Base de datos PostgreSQL
- ✅ Variables de entorno

**d) Primer despliegue (~5 min)**
```
Build: npm ci && npx prisma generate && npm run build
Start: node scripts/start.js  (migra DB + seed + inicia)
```

**e) Tu URL será:**
```
https://botellapp.onrender.com
```

> ⚠️ **Nota tier gratuito**: El servidor "duerme" después de 15min de inactividad. 
> Primera solicitud tarda ~30s en "despertar". Para producción real, usa plan Starter ($7/mes).

---

## 2️⃣ App de Escritorio (Windows/Mac/Linux)

### Método A: Instalar app compilada (usuarios finales)

Descargar desde GitHub Releases cuando estén disponibles.

### Método B: Compilar tú mismo

```bash
# 1. Editar URL del servidor
cd electron
nano src/main.js
# Cambiar línea 14: const BOTELLAPP_URL = "https://TU-APP.onrender.com";

# 2. Instalar dependencias
npm install

# 3. Probar localmente (conecta al servidor Render)
npm start

# 4. Compilar para Windows
npm run build:win
# → electron/dist/BOTELLAPP-Setup-1.0.0.exe

# 5. Compilar para Mac
npm run build:mac
# → electron/dist/BOTELLAPP-1.0.0.dmg

# 6. Compilar para Linux
npm run build:linux
# → electron/dist/BOTELLAPP-1.0.0.AppImage
```

---

## 3️⃣ App Móvil Android

### Opción A: PWA (Recomendada - Sin compilar nada)

1. Abrir BOTELLAPP en **Chrome** en el teléfono
2. Menú (⋮) → **"Agregar a pantalla de inicio"**
3. ¡Ya aparece como app con ícono de BOTELLAPP!

### Opción B: APK nativo (Capacitor)

```bash
# Prerrequisitos: Android Studio instalado
cd mobile
npm install

# Configurar URL
# Editar capacitor.config.ts línea 11:
# const BOTELLAPP_URL = "https://tu-app.onrender.com"

# Agregar plataforma Android
npx cap add android

# Sincronizar
npm run sync

# Abrir Android Studio
npm run open:android
```

En Android Studio:
1. **Build** → Generate Signed Bundle/APK
2. Seleccionar **APK**
3. Crear keystore (guárdalo seguro)
4. Build Release
5. El APK está en: `android/app/build/outputs/apk/release/`

**Instalar en teléfono:**
```bash
adb install -r app-release.apk
```

---

## 4️⃣ App iPhone (iOS)

### Opción A: PWA (Recomendada - Sin compilar nada)

1. Abrir BOTELLAPP en **Safari** en iPhone
2. Botón compartir (□↑) → **"Añadir a pantalla de inicio"**
3. ¡Aparece como app con ícono de BOTELLAPP!

### Opción B: IPA nativo (Capacitor - Solo Mac)

```bash
# Prerrequisitos: Xcode 15+ en Mac
cd mobile
npm install

# Agregar plataforma iOS
npx cap add ios

# Instalar pods
cd ios/App && pod install && cd ../..

# Sincronizar
npm run sync

# Abrir Xcode
npm run open:ios
```

En Xcode:
1. Seleccionar tu iPhone o simulador
2. **Product** → Archive
3. Para TestFlight: Distribute → App Store Connect
4. Para instalación directa: Distribute → Ad Hoc

---

## 🔧 Variables de entorno en Render

Render las configura automáticamente desde `render.yaml`. Si necesitas cambiarlas:

| Variable | Descripción | Valor |
|----------|-------------|-------|
| `DATABASE_URL` | PostgreSQL (auto) | Configurado por Render |
| `JWT_SECRET` | Clave JWT (auto) | Generada automáticamente |
| `NODE_ENV` | Entorno | `production` |
| `SMTP_HOST` | Servidor email (opcional) | `smtp.gmail.com` |
| `SMTP_USER` | Usuario email (opcional) | tu@gmail.com |
| `SMTP_PASS` | Contraseña app email | xxxxxxxx |

---

## 🔄 Actualizaciones

### Actualizar la web (Render)
Render re-despliega automáticamente cuando haces push a main:
```bash
git add -A && git commit -m "feat: nueva funcionalidad" && git push
```

### Actualizar apps de escritorio
Las apps Electron tienen auto-actualización configurada.
Solo publica una nueva release en GitHub y los usuarios recibirán la notificación.

### Actualizar apps móviles
- **PWA**: Se actualiza automáticamente (carga desde el servidor)
- **APK/IPA**: Recompilar y redistribuir

---

## 💡 Recomendación de arquitectura

```
┌─────────────────────────────────────────────┐
│           RENDER (PostgreSQL + Next.js)      │
│         https://botellapp.onrender.com       │
└─────────────┬───────────────────────────────┘
              │ HTTPS
     ┌────────┴────────┬──────────┬────────────┐
     │                 │          │            │
  🌐 Web           🖥️ Electron  📱 Android  📱 iPhone
  (Browser)        (Desktop)    (PWA/APK)  (PWA/IPA)
```

Un solo servidor, múltiples clientes. Actualiza el servidor y todos los clientes se actualizan.

