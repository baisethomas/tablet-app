import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Database, SupabaseSermon } from './types/database';
import { StorageService } from './storage/types';
import { SyncStatus } from './sync/types';

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

// Get Supabase URL and Anon Key from Expo Constants
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
export const supabase = createClient<Database>(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Export types
export { Database, SupabaseSermon } from './types/database';
export * from './storage/types';
export * from './sync/types';

// Export constants
export * from './storage/constants';

// Export interfaces for services (implementations will be added later)
export interface SupabaseServices {
  storage: StorageService;
  syncStatus: SyncStatus;
} 