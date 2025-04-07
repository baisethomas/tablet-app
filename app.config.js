export default {
  expo: {
    name: "Tablet Sermon Notes",
    slug: "tablet-sermon-notes",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      // Add other plugins here if needed
    ],
    // Explicitly enable the New Architecture
    experiments: {
      "tsconfigPaths": true // Keep if you use tsconfig paths
    },
    // Re-enable New Architecture
    newArchEnabled: true,
    extra: {
      ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY,
      APP_ENV: process.env.APP_ENV || 'development',
    }
  }
}; 