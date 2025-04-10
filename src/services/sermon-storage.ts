import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedSermon } from '../types/sermon'; // Ensure this path is correct

const STORAGE_KEY = 'savedSermons';

/**
 * Retrieves all saved sermons from AsyncStorage.
 * Handles parsing and potential data corruption.
 * @returns Promise resolving to an array of SavedSermon, empty if none found or error.
 */
export async function getAllSermons(): Promise<SavedSermon[]> {
  console.log('[SermonStorage] Getting all sermons...');
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData === null) {
      return []; // No data found
    }
    try {
      const sermonsArray = JSON.parse(existingData);
      if (!Array.isArray(sermonsArray)) {
        console.warn('[SermonStorage] Saved data is not an array, returning empty.');
        return []; // Data format error
      }
      // TODO: Add validation for individual sermon objects? Zod? 
      return sermonsArray as SavedSermon[]; // Assume correct type for now
    } catch (parseError) {
      console.error('[SermonStorage] Error parsing saved sermons:', parseError);
      // Consider clearing corrupted data: await AsyncStorage.removeItem(STORAGE_KEY);
      return []; // Return empty on parse error
    }
  } catch (error) {
    console.error('[SermonStorage] Error retrieving sermons:', error);
    return []; // Return empty on general retrieval error
  }
}

/**
 * Retrieves a single sermon by its ID.
 * @param id The ID of the sermon to retrieve.
 * @returns Promise resolving to the SavedSermon or null if not found.
 */
export async function getSermonById(id: string): Promise<SavedSermon | null> {
  console.log(`[SermonStorage] Getting sermon by ID: ${id}`);
  try {
    const allSermons = await getAllSermons();
    const foundSermon = allSermons.find(s => s.id === id);
    return foundSermon || null;
  } catch (error) {
    console.error(`[SermonStorage] Error getting sermon ${id}:`, error);
    return null;
  }
}

/**
 * Adds a new sermon to the beginning of the list in AsyncStorage.
 * @param sermon The new SavedSermon object to add.
 * @returns Promise resolving when the operation is complete.
 */
export async function addSermon(sermon: SavedSermon): Promise<void> {
  console.log(`[SermonStorage] Adding sermon: ${sermon.id}`);
  try {
    const currentSermons = await getAllSermons(); // Handles initial empty/error cases
    const updatedSermons = [sermon, ...currentSermons]; // Add to beginning
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSermons));
    console.log(`[SermonStorage] Sermon ${sermon.id} added successfully.`);
  } catch (error) {
    console.error(`[SermonStorage] Error adding sermon ${sermon.id}:`, error);
    throw error; // Re-throw error for caller to handle
  }
}

/**
 * Updates specific fields of an existing sermon.
 * @param id The ID of the sermon to update.
 * @param updates An object containing the fields to update.
 * @returns Promise resolving to the updated SavedSermon object.
 * @throws Error if the sermon with the given ID is not found.
 */
export async function updateSermon(
  id: string, 
  updates: Partial<SavedSermon>
): Promise<SavedSermon> {
  console.log(`[SermonStorage] Updating sermon: ${id}`);
  try {
    const currentSermons = await getAllSermons();
    const sermonIndex = currentSermons.findIndex(s => s.id === id);

    if (sermonIndex === -1) {
      throw new Error(`[SermonStorage] Cannot find sermon with ID ${id} to update.`);
    }

    // Merge updates with existing sermon data
    const updatedSermon = { 
      ...currentSermons[sermonIndex], 
      ...updates // Apply the updates
    };
    currentSermons[sermonIndex] = updatedSermon;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentSermons));
    console.log(`[SermonStorage] Sermon ${id} updated successfully.`);
    return updatedSermon; // Return the updated object
  } catch (error) {
    console.error(`[SermonStorage] Error updating sermon ${id}:`, error);
    throw error; // Re-throw error
  }
}

/**
 * Deletes a sermon by its ID.
 * @param id The ID of the sermon to delete.
 * @returns Promise resolving when the operation is complete.
 */
export async function deleteSermon(id: string): Promise<void> {
  console.log(`[SermonStorage] Deleting sermon: ${id}`);
  try {
    const currentSermons = await getAllSermons();
    const updatedSermons = currentSermons.filter(s => s.id !== id);
    
    if (updatedSermons.length === currentSermons.length) {
        console.warn(`[SermonStorage] Sermon with ID ${id} not found for deletion.`);
        // Decide if this should throw an error or just complete
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSermons));
    console.log(`[SermonStorage] Sermon ${id} deleted successfully.`);
  } catch (error) {
    console.error(`[SermonStorage] Error deleting sermon ${id}:`, error);
    throw error; // Re-throw error
  }
}

/**
 * Deletes ALL saved sermons from AsyncStorage.
 * Use with caution!
 * @returns Promise resolving when the operation is complete.
 */
export async function clearAllSermons(): Promise<void> {
  console.log('[SermonStorage] Clearing ALL sermons...');
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('[SermonStorage] All sermons cleared successfully.');
  } catch (error) {
    console.error('[SermonStorage] Error clearing all sermons:', error);
    throw error; // Re-throw error
  }
} 