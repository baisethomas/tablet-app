import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { SavedSermon } from '../../types/sermon';
import { useSermons } from '../../hooks/useSermons';
import { RouteProp } from '@react-navigation/native';

// Define params type
type NotesTabParams = {
  NotesTab: {
    sermon: SavedSermon;
    onNotesSaved?: (sermon: SavedSermon) => void;
  };
};

interface NotesTabProps {
  sermon?: SavedSermon;
  route?: RouteProp<NotesTabParams, 'NotesTab'>;
  onNotesSaved?: (sermon: SavedSermon) => void;
}

export function NotesTab({ sermon: propSermon, route, onNotesSaved }: NotesTabProps) {
  const { colors, fontSize, fontWeight } = useThemeStyles();
  const { updateSermonNotes } = useSermons();
  
  // Get sermon from either props or route params
  const routeParams = route?.params;
  const sermon = propSermon || routeParams?.sermon;
  const saveCallback = onNotesSaved || routeParams?.onNotesSaved;
  
  const [notes, setNotes] = useState<string>('');
  
  console.log("NotesTab - RENDERING NOW");
  console.log("NotesTab - Sermon data:", sermon?.id);
  console.log("NotesTab - Notes content:", sermon?.notes);
  console.log("NotesTab - Notes state:", notes);

  useEffect(() => {
    if (sermon?.notes) {
      setNotes(sermon.notes);
      console.log("NotesTab - Setting notes from sermon:", sermon.notes);
    }
  }, [sermon?.notes]);

  const handleSaveNotes = async () => {
    console.log("NotesTab - Saving notes:", notes);
    if (sermon?.id) {
      const updatedSermon = await updateSermonNotes(sermon.id, notes);
      if (updatedSermon && saveCallback) {
        saveCallback(updatedSermon);
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background.primary,
    },
    input: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      color: colors.text.primary,
      padding: 16,
      borderRadius: 8,
      fontSize: fontSize.body,
      lineHeight: 24,
      fontWeight: fontWeight('medium'),
      textAlignVertical: 'top',
      minHeight: 200,
      borderWidth: 1,
      borderColor: colors.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: fontSize.button,
      fontWeight: fontWeight('bold'),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: fontSize.title,
      fontWeight: fontWeight('semiBold'),
      color: colors.primary,
      textAlign: 'center',
      backgroundColor: colors.background.secondary,
      padding: 16,
      borderRadius: 8,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  });

  // Return empty state if no sermon data
  if (!sermon) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Unable to load sermon data. Please try again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Add your notes here..."
        placeholderTextColor={colors.text.secondary}
        value={notes}
        onChangeText={setNotes}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveNotes}
        disabled={notes.trim() === ''}
      >
        <Text style={styles.saveButtonText}>
          Save Notes
        </Text>
      </TouchableOpacity>
    </View>
  );
} 