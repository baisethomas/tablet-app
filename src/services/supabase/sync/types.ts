import { SupabaseSermon } from '../types/database';

/**
 * Type for sync operations
 */
export type SyncOperation = {
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  id: string;
  timestamp: number;
  retryCount: number;
};

/**
 * Type for sync queue
 */
export interface SyncQueue {
  operations: SyncOperation[];
  isProcessing: boolean;
  lastProcessed: number | null;
}

/**
 * Type for sync result
 */
export interface SyncResult {
  success: boolean;
  error?: string;
  operation?: SyncOperation;
}

/**
 * Type for conflict resolution
 */
export interface ConflictResolution {
  local: SupabaseSermon;
  remote: SupabaseSermon;
  resolution: 'local' | 'remote' | 'merge';
  mergedData?: Partial<SupabaseSermon>;
}

/**
 * Type for sync status
 */
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingOperations: number;
  error: string | null;
  conflicts: ConflictResolution[];
} 