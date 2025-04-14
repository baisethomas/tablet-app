import { StorageConfig } from './types';

/**
 * Default configuration for storage service
 */
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  bucketName: 'sermon_audio',
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedTypes: ['audio/m4a', 'audio/mp4', 'audio/mpeg'],
  chunkSize: 5 * 1024 * 1024, // 5MB chunks for upload
};

/**
 * Error codes for storage operations
 */
export const STORAGE_ERROR_CODES = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',
  DELETE_FAILED: 'DELETE_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

/**
 * Maximum number of retries for failed operations
 */
export const MAX_RETRIES = 3;

/**
 * Delay between retries in milliseconds
 */
export const RETRY_DELAY = 1000; // 1 second 