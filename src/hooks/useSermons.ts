import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedSermon } from '../types/sermon';
import {
  getAllSermons,
  addSermon as storageAddSermon,
  getSermonById as storageGetSermonById,
  updateSermon as storageUpdateSermon,
  deleteSermon as storageDeleteSermon,
} from '../services/sermon-storage';

/**
 * Custom hook for sermon data operations
 */
export function useSermons() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Updates notes for a specific sermon.
   */
  const updateSermonNotes = useCallback(async (sermonId: string, notes: string): Promise<SavedSermon | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedSermon = await storageUpdateSermon(sermonId, { notes });
      console.log(`Updated notes for sermon ${sermonId}`);
      return updatedSermon;
    } catch (e: any) {
      console.error('Failed to update sermon notes:', e);
      setError(e.message || 'Failed to update sermon notes.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Updates the title for a specific sermon.
   */
  const updateSermonTitle = useCallback(async (sermonId: string, title: string): Promise<SavedSermon | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedSermon = await storageUpdateSermon(sermonId, { title });
      console.log(`Updated title for sermon ${sermonId}`);
      return updatedSermon;
    } catch (e: any) {
      console.error('Failed to update sermon title:', e);
      setError(e.message || 'Failed to update sermon title.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Loads all saved sermons from storage.
   */
  const getSermons = useCallback(async (): Promise<SavedSermon[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const sermons = await getAllSermons();
      return sermons;
    } catch (e: any) {
      console.error('Failed to fetch sermons:', e);
      setError(e.message || 'Failed to load sermons.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    updateSermonNotes,
    updateSermonTitle,
    getSermons
  };
} 