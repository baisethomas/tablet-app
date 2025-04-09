import { StructuredSummary } from '../services/openai';

export interface SavedSermon {
  id: string; 
  date: string; 
  title?: string; 
  transcript: string; 
  notes?: string;
  audioUrl?: string;
  summary?: StructuredSummary;
} 