import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get environment variables from app.config.ts
const extra = Constants.expoConfig?.extra || {};

// Validate required environment variables
const requiredEnvVars = [
  'ASSEMBLYAI_API_KEY',
  'OPENAI_API_KEY',
  'BIBLE_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !extra[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  if (Platform.OS === 'web') {
    alert(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

export const env = {
  assemblyAiApiKey: extra.ASSEMBLYAI_API_KEY,
  openAiApiKey: extra.OPENAI_API_KEY,
  bibleApiKey: extra.BIBLE_API_KEY,
  supabaseUrl: extra.SUPABASE_URL,
  supabaseAnonKey: extra.SUPABASE_ANON_KEY,
  isDevelopment: extra.APP_ENV === 'development',
  isDebug: extra.DEBUG === 'true'
}; 