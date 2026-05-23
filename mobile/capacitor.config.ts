import type { CapacitorConfig } from "@capacitor/cli";

/**
 * BOTELLAPP Mobile App - Capacitor Configuration
 * 
 * This creates a native Android/iOS app that loads the deployed web app.
 * Change BOTELLAPP_URL to your Render deployment URL.
 */

const BOTELLAPP_URL = process.env.BOTELLAPP_URL || "https://botellapp.onrender.com";

const config: CapacitorConfig = {
  appId: "cl.botellapp.app",
  appName: "BOTELLAPP",
  webDir: "www",
  server: {
    // Load the deployed web app in the native WebView
    url: BOTELLAPP_URL,
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    contentInset: "always",
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f1117",
      androidSplashResourceName: "splash",
      showSpinner: true,
      spinnerColor: "#7c3aed",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#0f1117",
    },
  },
};

export default config;
