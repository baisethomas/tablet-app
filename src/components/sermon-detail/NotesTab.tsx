import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { SavedSermon } from '../../types/sermon';
import { useSermons } from '../../hooks/useSermons';
import type { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';

// Define params type for the navigator itself
type SermonDetailTabParamList = { // Assuming this list is defined elsewhere, matching SermonDetailScreen
  Summary: undefined;
  Transcript: undefined;
  Notes: { // Define expected params for Notes tab specifically if needed, or use sermon directly
      sermon: SavedSermon;
      onNotesSaved?: (sermon: SavedSermon) => void;
  };
};

// Use MaterialTopTabScreenProps for the specific screen's props
interface NotesTabProps {
  sermon?: SavedSermon; // Keep direct prop for flexibility
  route?: MaterialTopTabScreenProps<SermonDetailTabParamList, 'Notes'>['route']; // Use the correct type and key
  onNotesSaved?: (sermon: SavedSermon) => void;
}

export function NotesTab({ sermon: propSermon, route, onNotesSaved }: NotesTabProps) {
  const { colors, theme, fontWeight } = useThemeStyles();
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
    setNotes(sermon?.notes || '');
    console.log("NotesTab - Setting notes from sermon:", sermon?.notes);
  }, [sermon?.notes]);

  const handleSaveNotes = async () => {
    console.log("NotesTab - Saving notes:", notes);
    if (sermon?.id) {
      try {
        const updatedSermon = await updateSermonNotes(sermon.id, notes);
        if (updatedSermon && saveCallback) {
          saveCallback(updatedSermon);
          Keyboard.dismiss();
        }
      } catch (error) {
        console.error("Error saving notes:", error);
      }
    }
  };

  const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
      flex: 1,
    },
    outerContainer: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    innerContainer: {
      flex: 1,
      padding: theme.spacing.md,
      justifyContent: 'space-between',
    },
    input: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      color: colors.text.primary,
      padding: theme.spacing.md,
      borderRadius: 8,
      fontSize: theme.fontSizes.body,
      lineHeight: theme.lineHeights.body * 1.3,
      fontWeight: fontWeight('regular'),
      textAlignVertical: 'top',
      marginBottom: theme.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.ui.border,
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingVertical: theme.spacing.sm + 2,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: theme.fontSizes.button,
      fontWeight: fontWeight('bold'),
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
      backgroundColor: colors.background.primary,
    },
    emptyText: {
      fontSize: theme.fontSizes.title,
      fontWeight: fontWeight('medium'),
      color: colors.text.secondary,
      textAlign: 'center',
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.outerContainer}>
          <View style={styles.innerContainer}>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Thoughts..."
              placeholderTextColor={colors.text.secondary}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveNotes}
              disabled={notes === (sermon.notes || '')}
            >
              <Text style={styles.saveButtonText}>
                Save Notes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
} 