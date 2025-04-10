// import 'dotenv/config'; // Remove explicit dotenv import

export default {
  expo: {
    name: "Tablet Sermon Notes", // Placeholder - verify if correct
    slug: "tablet-sermon-notes", // Placeholder - verify if correct
    version: "1.0.0",          // Placeholder - verify if correct
    orientation: "portrait",
    icon: "./assets/images/icon.png", // Placeholder - verify path
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png", // Placeholder - verify path
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.baisethomas.tablet-sermon-notes", // Placeholder - verify
      infoPlist: {
        UIBackgroundModes: [
          "audio"
        ],
        "NSMicrophoneUsageDescription": "This app uses the microphone to record audio for transcription."
      }
    },
    android: {
      // Placeholder for Android config - Add google-services.json later
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png", // Placeholder - verify path
        backgroundColor: "#ffffff"
      },
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_MICROPHONE"
      ]
      // googleServicesFile: "./google-services.json" // Add this when you have the file
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png" // Placeholder - verify path
    },
    plugins: [
      // Remove Firebase plugins entry
      // We might still need expo-build-properties for other things later,
      // but let's remove it for now to be clean. Can re-add if needed.
      // [
      //   "expo-build-properties",
      //   {
      //     // Cleaned options
      //   }
      // ],
    ],
    experiments: {
      "tsconfigPaths": true // Keep if you use tsconfig paths
    },
    // Use the old architecture for now due to Firebase build issues
    newArchEnabled: false,
    extra: {
      ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY,
      APP_ENV: process.env.APP_ENV || 'development',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      // Add Supabase keys
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    }
  }
};