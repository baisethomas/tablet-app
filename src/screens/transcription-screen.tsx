import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ThemedText } from '../components/ThemedText';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { SavedSermon } from '../types/sermon';

// Assume these functions exist and are imported from your service file
import {
  uploadAudioFile,
  submitBatchJob,
  pollBatchJobStatus
} from '../services/assemblyai';

interface TranscriptionScreenProps {
  route: {
    params: {
      sermon: SavedSermon;
    };
  };
}

export function TranscriptionScreen({ route }: TranscriptionScreenProps) {
  const { sermon } = route.params;
  const { colors, spacing } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={[styles.container, { padding: spacing.md }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText variant="secondary" style={{ marginTop: spacing.md }}>
          Processing transcription...
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { padding: spacing.md }]}>
        <ErrorDisplay message={error} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { padding: spacing.md }]}>
      <View style={[styles.content, { backgroundColor: colors.background.secondary, padding: spacing.md, borderRadius: spacing.md }]}>
        <ThemedText variant="title" style={{ marginBottom: spacing.sm }}>
          {sermon.title || 'Sermon'}
        </ThemedText>
        <ThemedText style={{ lineHeight: 24 }}>
          {sermon.transcript || 'No transcript available'}
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    marginBottom: 16,
  },
}); 