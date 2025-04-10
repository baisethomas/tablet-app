import 'react-native-url-polyfill/auto'; // Required for Supabase to work in React Native
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Adapter for using Expo SecureStore with Supabase
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Get Supabase URL and Anon Key from Expo Constants (populated from .env via app.config.js)
const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;

// Basic validation
if (!supabaseUrl) {
  console.error('Supabase URL is not set. Check your .env file and app.config.js');
}
if (!supabaseAnonKey) {
  console.error('Supabase Anon Key is not set. Check your .env file and app.config.js');
}

// Initialize the Supabase client
export const supabase = createClient(
  supabaseUrl ?? '', // Use empty string if null/undefined to satisfy TS, error handled above
  supabaseAnonKey ?? '', // Use empty string if null/undefined
  {
    auth: {
      storage: ExpoSecureStoreAdapter, // Use SecureStore for session persistence
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Important for React Native, default is true
    },
  }
); 