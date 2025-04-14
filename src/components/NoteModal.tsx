import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface NoteModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => Promise<void>;
}

export function NoteModal({ isVisible, onClose, onSave }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors, spacing, typography, borderRadius } = useTheme();

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please enter both title and content');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(title, content);
      setTitle('');
      setContent('');
      onClose();
    } catch (err) {
      setError('Failed to save note. Please try again.');
      console.error('Error saving note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          {
            backgroundColor: colors.background.primary,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
          }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              {
                color: colors.text.primary,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
              }
            ]}>
              Create New Note
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {error && (
            <View style={[
              styles.errorContainer,
              {
                backgroundColor: colors.error + '20',
                padding: spacing.sm,
                borderRadius: borderRadius.sm,
                marginBottom: spacing.md,
              }
            ]}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text style={[
                styles.errorText,
                {
                  color: colors.error,
                  marginLeft: spacing.sm,
                  fontSize: typography.fontSize.sm,
                }
              ]}>
                {error}
              </Text>
            </View>
          )}

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text.primary,
                borderColor: colors.border,
                backgroundColor: colors.background.secondary,
                padding: spacing.md,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.md,
              }
            ]}
            placeholder="Note Title"
            placeholderTextColor={colors.text.secondary}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[
              styles.input,
              styles.contentInput,
              {
                color: colors.text.primary,
                borderColor: colors.border,
                backgroundColor: colors.background.secondary,
                padding: spacing.md,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.md,
                marginTop: spacing.md,
              }
            ]}
            placeholder="Note Content"
            placeholderTextColor={colors.text.secondary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          <View style={[
            styles.buttonContainer,
            {
              marginTop: spacing.lg,
              gap: spacing.md,
            }
          ]}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                {
                  borderColor: colors.border,
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                }
              ]}
              onPress={handleClose}
            >
              <Text style={[
                styles.buttonText,
                {
                  color: colors.text.primary,
                  fontSize: typography.fontSize.md,
                  fontWeight: typography.fontWeight.medium,
                }
              ]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                {
                  backgroundColor: colors.primary,
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                }
              ]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={[
                  styles.buttonText,
                  {
                    color: colors.text.inverse,
                    fontSize: typography.fontSize.md,
                    fontWeight: typography.fontWeight.medium,
                  }
                ]}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    minHeight: 40,
  },
  contentInput: {
    minHeight: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    marginLeft: 8,
  },
  buttonText: {
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
  },
}); 