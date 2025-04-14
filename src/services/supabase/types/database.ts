import { SavedSermon } from '../../../types/sermon';

/**
 * Extended sermon type for Supabase storage
 * Includes additional fields needed for cloud sync
 */
export interface SupabaseSermon extends SavedSermon {
  user_id: string;
  created_at: string;
  updated_at: string;
  is_synced: boolean;
  version: number;
}

/**
 * Database schema types for Supabase
 */
export interface Database {
  public: {
    Tables: {
      sermons: {
        Row: SupabaseSermon;
        Insert: Omit<SupabaseSermon, 'created_at' | 'updated_at'>;
        Update: Partial<SupabaseSermon>;
      };
    };
    Storage: {
      Buckets: {
        sermon_audio: {
          Path: string;
          PublicUrl: string | null;
        };
      };
    };
  };
}

/**
 * Type for database operations
 */
export type DbOperation = 'create' | 'update' | 'delete';

/**
 * Type for sync status
 */
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingOperations: number;
  error: string | null;
} 