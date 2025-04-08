import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedSermon } from '../types/sermon';

/**
 * Custom hook for sermon data operations
 */
export function useSermons() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Updates notes for a specific sermon and saves to AsyncStorage
   */
  const updateSermonNotes = useCallback(async (sermonId: string, notes: string): Promise<SavedSermon | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get all sermons from storage
      const existingData = await AsyncStorage.getItem('savedSermons');
      if (existingData === null) {
        throw new Error('No saved sermons found.');
      }
      
      let sermonsArray: SavedSermon[] = [];
      try {
        sermonsArray = JSON.parse(existingData);
        if (!Array.isArray(sermonsArray)) {
          throw new Error('Saved sermons data is not an array.');
        }
      } catch (parseError) {
        console.error('Error parsing saved sermons:', parseError);
        throw new Error('Could not parse sermon data.');
      }
      
      // Find and update the target sermon
      const sermonIndex = sermonsArray.findIndex(sermon => sermon.id === sermonId);
      if (sermonIndex === -1) {
        throw new Error(`Sermon with ID ${sermonId} not found.`);
      }
      
      // Update the notes
      const updatedSermon = {
        ...sermonsArray[sermonIndex],
        notes
      };
      
      sermonsArray[sermonIndex] = updatedSermon;
      
      // Save back to storage
      await AsyncStorage.setItem('savedSermons', JSON.stringify(sermonsArray));
      
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
   * Loads all saved sermons from AsyncStorage
   */
  const getSermons = useCallback(async (): Promise<SavedSermon[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const existingData = await AsyncStorage.getItem('savedSermons');
      if (existingData === null) {
        return [];
      }
      
      try {
        const sermonsArray = JSON.parse(existingData);
        if (!Array.isArray(sermonsArray)) {
          console.warn('Saved sermons data is not an array, returning empty array.');
          return [];
        }
        return sermonsArray;
      } catch (parseError) {
        console.error('Error parsing saved sermons:', parseError);
        throw new Error('Could not parse sermon data.');
      }
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
    getSermons
  };
} 