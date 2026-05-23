# BOTELLAPP Mobile App

App nativa para **Android** e **iOS** usando Capacitor.

## 📱 ¿Qué es esto?

Una app nativa que carga BOTELLAPP desde tu servidor Render dentro de un WebView nativo. Esto significa:

- ✅ Ícono en la pantalla de inicio
- ✅ Splash screen con logo
- ✅ Sin barra de navegación del browser
- ✅ Notificaciones push (opcional)
- ✅ Funciona igual que una app nativa

## 🚀 Pasos para compilar

### Prerrequisitos

**Para Android:**
- Android Studio instalado
- Android SDK configurado
- Java 17+

**Para iOS (solo en Mac):**
- Xcode 15+
- CocoaPods: `sudo gem install cocoapods`

### 1. Instalar dependencias

```bash
cd mobile
npm install
```

### 2. Configurar URL del servidor

Edita `capacitor.config.ts` línea 11:
```typescript
const BOTELLAPP_URL = "https://TU-APP.onrender.com";
```

### 3. Inicializar plataformas

```bash
# Android
npx cap add android

# iOS (solo Mac)
npx cap add ios
```

### 4. Sincronizar

```bash
npm run sync
```

### 5. Abrir en IDE

```bash
# Android Studio
npm run open:android

# Xcode (solo Mac)
npm run open:ios
```

### 6. Compilar APK (Android)

En Android Studio:
1. Build → Generate Signed Bundle / APK
2. Seleccionar APK
3. Crear o seleccionar keystore
4. Build

El APK queda en `android/app/build/outputs/apk/release/`

### 7. Compilar IPA (iOS)

En Xcode:
1. Product → Archive
2. Distribute App
3. App Store Connect (para TestFlight) o Ad Hoc

## 📲 Instalar en Android sin App Store

```bash
# Conecta el teléfono con USB debugging activo
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔔 Notificaciones Push (opcional)

Para habilitar notificaciones push:
1. Crear proyecto en Firebase Console
2. Descargar `google-services.json` → poner en `android/app/`
3. Para iOS: descargar `GoogleService-Info.plist` → poner en `ios/App/App/`

## 💡 PWA vs App Nativa

Si no quieres compilar una app nativa, los usuarios pueden instalar BOTELLAPP como PWA:

1. Abrir BOTELLAPP en Chrome (Android) o Safari (iOS)
2. Tap en **Compartir → Agregar a pantalla de inicio**
3. ¡Listo! BOTELLAPP aparece como app nativa

La PWA ya está configurada en el proyecto.
