import { StructuredSummary } from '../services/openai';
import { TranscriptionResponse } from '../services/assemblyai';

export interface SavedSermon {
  id: string; 
  date: string; 
  title?: string; 
  transcript: string; 
  transcriptData?: TranscriptionResponse;
  notes?: string;
  audioUrl?: string;
  summary?: StructuredSummary;
  durationMillis?: number;
  processingStatus?: 'processing' | 'completed' | 'error';
  processingError?: string;
} 