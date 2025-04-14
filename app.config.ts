import { ExpoConfig, ConfigContext } from 'expo/config';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'ASSEMBLYAI_API_KEY',
  'OPENAI_API_KEY',
  'BIBLE_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export default ({ config }: ConfigContext): ExpoConfig => {
  console.log('Environment variables loaded:', {
    BIBLE_API_KEY: process.env.BIBLE_API_KEY,
    APP_ENV: process.env.APP_ENV,
    DEBUG: process.env.DEBUG
  });

  return {
    ...config,
    name: 'Tablet',
    slug: 'tablet-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.tablet.app'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.tablet.app'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    plugins: [
      'expo-router',
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#ffffff',
          sounds: ['./assets/notification-sound.wav']
        }
      ]
    ],
    extra: {
      ASSEMBLYAI_API_KEY: process.env.ASSEMBLYAI_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      BIBLE_API_KEY: process.env.BIBLE_API_KEY,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      APP_ENV: process.env.APP_ENV,
      DEBUG: process.env.DEBUG,
      eas: {
        projectId: 'your-project-id'
      }
    },
    owner: 'your-expo-username',
    newArchEnabled: true
  };
}; 