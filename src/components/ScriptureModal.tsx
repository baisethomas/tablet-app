import React from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { BibleServiceError } from '../services/bibleService';

interface ScriptureModalProps {
  isVisible: boolean;
  onClose: () => void;
  verseContent?: string;
  reference?: string;
  isLoading: boolean;
  error?: Error | null;
}

export function ScriptureModal({ isVisible, onClose, verseContent, reference, isLoading, error }: ScriptureModalProps) {
  const { colors } = useTheme();

  React.useEffect(() => {
    if (error) {
      if (error instanceof BibleServiceError) {
        switch (error.code) {
          case 'API_KEY_MISSING':
            console.error('[ScriptureModal] Bible API key is not configured');
            break;
          case 'NETWORK_ERROR':
            console.error('[ScriptureModal] Network error while fetching scripture');
            break;
          case 'INVALID_REFERENCE':
            console.error('[ScriptureModal] Invalid scripture reference');
            break;
          case 'RATE_LIMIT_EXCEEDED':
            console.error('[ScriptureModal] Rate limit exceeded');
            break;
          default:
            console.error('[ScriptureModal] Error:', error.message);
        }
      } else {
        console.error('[ScriptureModal] Unexpected error:', error);
      }
    }
  }, [error]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.content, { backgroundColor: colors.background.primary }]}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : error ? (
            <Text style={[styles.errorText, { color: colors.text.primary }]}>
              {error instanceof BibleServiceError ? error.message : 'Failed to load scripture'}
            </Text>
          ) : (
            <>
              {reference && (
                <Text style={[styles.reference, { color: colors.primary }]}>
                  {reference}
                </Text>
              )}
              {verseContent && (
                <Text style={[styles.contentText, { color: colors.text.primary }]}>
                  {verseContent}
                </Text>
              )}
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  reference: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 