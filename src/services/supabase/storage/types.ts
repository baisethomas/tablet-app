import { Database } from '../types/database';

/**
 * Configuration for storage service
 */
export interface StorageConfig {
  bucketName: string;
  maxFileSize: number;
  allowedTypes: string[];
  chunkSize: number;
}

/**
 * Progress callback for upload/download operations
 */
export type ProgressCallback = (progress: number) => void;

/**
 * Storage service interface
 */
export interface StorageService {
  /**
   * Upload an audio file to Supabase storage
   */
  uploadAudio(
    uri: string,
    sermonId: string,
    onProgress?: ProgressCallback
  ): Promise<string>;

  /**
   * Download an audio file from Supabase storage
   */
  downloadAudio(
    url: string,
    sermonId: string,
    onProgress?: ProgressCallback
  ): Promise<string>;

  /**
   * Delete an audio file from Supabase storage
   */
  deleteAudio(url: string): Promise<void>;

  /**
   * Get the public URL for an audio file
   */
  getPublicUrl(path: string): string;
}

/**
 * Error types for storage operations
 */
export interface StorageError extends Error {
  code: string;
  details?: string;
  hint?: string;
} 