import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { ThemedText } from '../ThemedText';
import { ThemedButton } from '../ThemedButton';
import { SavedSermon } from '../../types/sermon';

interface NotesTabProps {
  sermon: SavedSermon;
  onUpdate: (updatedSermon: SavedSermon) => void;
}

const createStyles = (colors: any, spacing: any, borderRadius: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'transparent',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: colors.text.primary,
  },
});

export function NotesTab({ sermon, onUpdate }: NotesTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(sermon.notes || '');
  const { colors, typography, spacing, borderRadius, isLoading: isThemeLoading } = useTheme();
  const styles = createStyles(colors, spacing, borderRadius);

  if (isThemeLoading || !colors || !spacing || !borderRadius) {
    return null;
  }

  const handleSave = () => {
    onUpdate({
      ...sermon,
      notes: editedNotes,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedNotes(sermon.notes || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <View style={[styles.container, { padding: spacing.md }]}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background.secondary,
              color: colors.text.primary,
              borderColor: colors.border,
              borderRadius: borderRadius.md,
              padding: spacing.md,
            }
          ]}
          multiline
          value={editedNotes}
          onChangeText={setEditedNotes}
          placeholder="Add your notes here..."
          placeholderTextColor={colors.text.secondary}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSave}
          >
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              Save Notes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleCancel}
          >
            <Ionicons name="close-outline" size={20} color={colors.text.primary} />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { padding: spacing.md }]}>
      {sermon.notes ? (
        <View>
          <ThemedText variant="primary">{sermon.notes}</ThemedText>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { alignSelf: 'flex-start', marginTop: spacing.md }]}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil-outline" size={20} color={colors.text.primary} />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Edit Notes
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => setIsEditing(true)}
        >
          <Ionicons name="add-outline" size={20} color="#FFFFFF" />
          <Text style={[styles.buttonText, styles.primaryButtonText]}>
            Add Notes
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
} 