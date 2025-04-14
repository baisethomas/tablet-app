import { StructuredSummary } from '../services/openai';
import { TranscriptionResponse } from '../services/assemblyai';

export interface SavedSermon {
  id: string; 
  date: string; 
  title?: string; 
  transcript: string; 
  transcriptData?: TranscriptionResponse;
  processingStatus?: string;
  processingError?: string;
  durationMillis?: number;
  type: 'recording' | 'note';
  notes?: string;
  audioUrl?: string;
  summary?: StructuredSummary;
} 