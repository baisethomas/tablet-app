import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Keyboard,
  ScrollView
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { SavedSermon } from '../../types/sermon';
import { useSermons } from '../../hooks/useSermons';
// import { RouteProp } from '@react-navigation/native'; // Remove this

// Define params type for the navigator itself
type SermonDetailTabParamList = { // Assuming this list is defined elsewhere, matching SermonDetailScreen
  Summary: undefined;
  Transcript: undefined;
  Notes: { // Define expected params for Notes tab specifically if needed, or use sermon directly
      sermon: SavedSermon;
      onNotesSaved?: (sermon: SavedSermon) => void;
  };
};

// Keep the more specific SermonDetailTabParamList if defined elsewhere, 
// but simplify NotesTabParams for local use with RouteProp
type NotesTabParams = {
  Notes: {
    sermon: SavedSermon;
    onNotesSaved?: (sermon: SavedSermon) => void;
  };
};

// Revert to using RouteProp for props
interface NotesTabProps {
  sermon?: SavedSermon; 
  route?: any; // Use 'any' as a temporary workaround for type errors
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
    outerContainer: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    innerContainer: {
      flexGrow: 1,
      padding: theme.spacing.md,
      justifyContent: 'space-between',
    },
    input: {
      minHeight: 200,
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
    <KeyboardAwareScrollView
      style={styles.outerContainer}
      contentContainerStyle={styles.innerContainer}
      resetScrollToCoords={{ x: 0, y: 0 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        style={styles.input}
        multiline
        placeholder="Thoughts..."
        placeholderTextColor={colors.text.secondary}
        value={notes}
        onChangeText={setNotes}
        textAlignVertical="top"
        scrollEnabled={false}
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
    </KeyboardAwareScrollView>
  );
} 