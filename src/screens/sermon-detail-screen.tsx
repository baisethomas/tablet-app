import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  TextInput,
  TouchableOpacity
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/theme-context';
import type { RootStackParamList } from '../navigation/app-navigator'; // Import shared param list

// Define the structure for saved data (copied again)
interface SavedSermon {
  id: string; 
  date: string; 
  title?: string; 
  transcript: string; 
  notes?: string; // Add optional notes field
}

// Define the route prop type for this screen
type SermonDetailScreenRouteProp = RouteProp<RootStackParamList, 'SermonDetail'>;

export function SermonDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute<SermonDetailScreenRouteProp>();
  const { sermonId } = route.params;

  const [sermon, setSermon] = useState<SavedSermon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState<string>(''); // State for notes input
  const [isSaving, setIsSaving] = useState(false); // State for save indicator
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track unsaved changes

  useEffect(() => {
    const loadSermonDetail = async () => {
      setIsLoading(true);
      setError(null);
      setSermon(null);
      
      try {
        const existingData = await AsyncStorage.getItem('savedSermons');
        if (existingData === null) {
          throw new Error('No saved sermons found.');
        }

        let sermonsArray: SavedSermon[] = [];
        try {
          sermonsArray = JSON.parse(existingData);
          if (!Array.isArray(sermonsArray)) {
            console.warn('Saved sermons data is not an array.');
            throw new Error('Saved data format error.');
          }
        } catch (parseError) {
          console.error('Error parsing saved sermons:', parseError);
          throw new Error('Could not load sermon detail.');
        }

        const foundSermon = sermonsArray.find(s => s.id === sermonId);

        if (!foundSermon) {
          throw new Error(`Sermon with ID ${sermonId} not found.`);
        }

        setSermon(foundSermon);
        setCurrentNotes(foundSermon.notes || ''); // Initialize notes state
        setHasUnsavedChanges(false); // Reset unsaved changes flag

      } catch (e: any) {
        console.error('Failed to fetch sermon detail:', e);
        setError(e.message || 'Failed to load sermon details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (sermonId) {
      loadSermonDetail();
    }

  }, [sermonId]); // Re-run effect if sermonId changes

  // Update notes state and flag unsaved changes
  const handleNotesChange = (text: string) => {
    setCurrentNotes(text);
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  };

  // --- Save Notes Logic --- 
  const handleSaveNotes = async () => {
    if (!sermon || !hasUnsavedChanges) return; // No sermon loaded or no changes

    setIsSaving(true);
    setError(null);

    try {
      const existingData = await AsyncStorage.getItem('savedSermons');
      if (existingData === null) throw new Error('Cannot find saved sermons data.');
      
      let sermonsArray: SavedSermon[] = [];
      try {
        sermonsArray = JSON.parse(existingData);
        if (!Array.isArray(sermonsArray)) throw new Error('Saved data format error.');
      } catch (parseError) {
        throw new Error('Could not parse saved data.');
      }

      // Find index and update the specific sermon
      const sermonIndex = sermonsArray.findIndex(s => s.id === sermonId);
      if (sermonIndex === -1) throw new Error ('Could not find sermon to update.');

      // Create updated sermon object
      const updatedSermon = { ...sermonsArray[sermonIndex], notes: currentNotes };
      sermonsArray[sermonIndex] = updatedSermon;

      // Save the entire updated array back
      await AsyncStorage.setItem('savedSermons', JSON.stringify(sermonsArray));

      // Update local sermon state as well to reflect saved state
      setSermon(updatedSermon);
      setHasUnsavedChanges(false); // Reset flag after successful save
      Alert.alert('Success', 'Notes saved successfully.');

    } catch (e: any) {
      console.error('Failed to save notes:', e);
      setError('Failed to save notes. Please try again.');
      Alert.alert('Error', 'Failed to save notes.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centeredInfo}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centeredInfo}>
          <Text style={[styles.errorText, { color: colors.ui.error }]}>{error}</Text>
          {/* Optionally add a button to go back? */}
        </View>
      );
    }
    if (!sermon) { // Should ideally be covered by error state, but good fallback
      return (
         <View style={styles.centeredInfo}>
          <Text style={[styles.infoText, { color: colors.text.secondary }]}>Sermon not found.</Text>
        </View>
      )
    }

    // Display Sermon Details + Notes Input
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {sermon.title && (
          <Text style={[styles.title, { color: colors.text.primary }]}>{sermon.title}</Text>
        )}
        <Text style={[styles.date, { color: colors.text.secondary }]}>
          Recorded on: {new Date(sermon.date).toLocaleString()}
        </Text>
        
        {/* Transcript Section */}
        <Text style={[styles.sectionHeader, { color: colors.text.primary }]}>Transcript</Text>
        <View style={[styles.transcriptContainer, { borderColor: colors.ui.border }]}>
           <Text style={[
             styles.transcript, 
             { color: 'black' }
             ]}>
            {sermon.transcript}
          </Text>
        </View>

        {/* Notes Section */}
        <Text style={[styles.sectionHeader, { color: colors.text.primary }]}>Notes</Text>
        <TextInput
          style={[
            styles.notesInput,
            {
              color: colors.text.primary,
              backgroundColor: colors.background.primary, // Input background
              borderColor: colors.ui.border,
            }
          ]}
          placeholder="Add your notes here..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          value={currentNotes}
          onChangeText={handleNotesChange}
          textAlignVertical="top"
        />

        {/* Save Button - show only if changes */}
        {hasUnsavedChanges && (
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.primary }]} 
            onPress={handleSaveNotes} 
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Notes</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80, // Add padding at bottom for save button area
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  transcriptContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F8F8F8',
    marginBottom: 20,
  },
  transcript: {
    fontSize: 16,
    lineHeight: 24,
  },
  notesInput: {
    minHeight: 150, 
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  saveButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, 
    minHeight: 50,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoText: {
      fontSize: 16,
      textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 