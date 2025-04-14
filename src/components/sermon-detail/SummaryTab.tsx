import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ThemedText } from '../ThemedText';
import { SavedSermon } from '../../types/sermon';
import { generateSermonSummary, StructuredSummary } from '../../services/openai';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { ScriptureModal } from '../ScriptureModal';
import { fetchScriptureContent } from '../../services/bibleService';

// Define params type
type SummaryTabParams = {
  SummaryTab: {
    sermon: SavedSermon;
  };
};

interface SummaryTabProps {
  sermon: SavedSermon;
}

const createStyles = (colors: any, spacing: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    marginBottom: 16,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  scriptureContainer: {
    marginBottom: spacing.md,
  },
  scriptureText: {
    marginBottom: spacing.xs,
  },
  scriptureReference: {
    marginBottom: spacing.xs,
    padding: spacing.xs,
    borderRadius: 4,
  },
  scriptureReferenceText: {
    textDecorationLine: 'underline',
  },
  scriptureButton: {
    marginTop: spacing.xs,
  },
  pressableHighlight: {
    backgroundColor: colors.backgroundHighlight,
  }
});

export function SummaryTab({ sermon }: SummaryTabProps) {
  const { colors, spacing, isLoading: isThemeLoading } = useTheme();
  const styles = createStyles(colors, spacing);
  const [summary, setSummary] = useState<StructuredSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Scripture interaction state
  const [selectedScripture, setSelectedScripture] = useState<string | null>(null);
  const [verseContent, setVerseContent] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVerseLoading, setIsVerseLoading] = useState(false);
  
  // Add defensive check for sermon
  if (!sermon) {
    console.error("SummaryTab - Sermon is undefined or null");
    return (
      <View style={[{ flex: 1, padding: spacing.md }]}>
        <ThemedText variant="secondary">
          No sermon data available. Please try again later.
        </ThemedText>
      </View>
    );
  }

  useEffect(() => {
    const fetchSummary = async () => {
      if (!sermon.transcript) {
        setError('No transcript available to summarize.');
        setIsLoading(false);
        return;
      }

      try {
        const result = await generateSermonSummary(sermon.transcript);
        setSummary(result);
        setError(null);
      } catch (err) {
        setError('Failed to generate summary. Please try again later.');
        console.error('Error generating summary:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [sermon.id, sermon.transcript]);

  // Handle scripture reference clicks
  const handleScripturePress = async (reference: string) => {
    try {
      setSelectedScripture(reference);
      setIsModalVisible(true);
      setIsVerseLoading(true);
      setVerseContent('');
      
      console.log(`[SummaryTab] Fetching scripture content for: ${reference}`);
      const content = await fetchScriptureContent(reference);
      setVerseContent(content);
    } catch (err: any) {
      console.error(`[SummaryTab] Error fetching scripture: ${err.message}`);
      // Handle specific error types
      if (err.name === 'BibleServiceError') {
        if (err.code === 'API_KEY_MISSING') {
          Alert.alert('Configuration Error', 'Bible API key is not configured. Please check your .env file.');
        } else if (err.code === 'NETWORK_ERROR') {
          Alert.alert('Network Error', 'Failed to connect to Bible API. Please check your internet connection.');
        } else if (err.code === 'INVALID_REFERENCE') {
          Alert.alert('Error', 'Invalid scripture reference. Please try a different reference.');
        } else {
          Alert.alert('Error', err.message || 'Failed to load scripture content.');
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred while fetching scripture content.');
      }
      setVerseContent('Error loading scripture content.');
    } finally {
      setIsVerseLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedScripture(null);
    setVerseContent('');
  };

  if (isThemeLoading || !colors || !spacing) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { padding: spacing.md }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText variant="secondary" style={{ marginTop: spacing.md }}>
          Generating summary...
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { padding: spacing.md }]}>
        <ThemedText variant="secondary">{error}</ThemedText>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={[styles.container, { padding: spacing.md }]}>
        <ThemedText variant="secondary">No summary available</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { padding: spacing.md }]}>
      <View style={styles.content}>
        {/* Sermon Summary */}
        <View style={styles.section}>
          <ThemedText variant="primary" weight="bold" size="lg" style={styles.sectionTitle}>
            Summary
          </ThemedText>
          <ThemedText variant="primary" size="md">
            {summary.overview}
          </ThemedText>
        </View>

        {/* Key Scriptures */}
        <View style={styles.section}>
          <ThemedText variant="primary" weight="bold" size="lg" style={styles.sectionTitle}>
            Key Scriptures
          </ThemedText>
          {summary.scriptures.map((ref, index) => (
            <View key={index} style={styles.scriptureContainer}>
              <Pressable 
                onPress={() => handleScripturePress(ref)}
                style={({ pressed }) => [
                  styles.scriptureReference,
                  pressed && styles.pressableHighlight
                ]}
              >
                <ThemedText 
                  variant="primary" 
                  weight="medium" 
                  size="md" 
                  style={styles.scriptureReferenceText}
                >
                  {ref}
                </ThemedText>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Key Points */}
        <View style={styles.section}>
          <ThemedText variant="primary" weight="bold" size="lg" style={styles.sectionTitle}>
            Key Points
          </ThemedText>
          {summary.keyPoints.map((point, index) => (
            <ThemedText key={index} variant="primary" size="md" style={styles.scriptureText}>
              • {point}
            </ThemedText>
          ))}
        </View>

        {/* Single Scripture Modal */}
        <ScriptureModal
          isVisible={isModalVisible}
          reference={selectedScripture || ''}
          verseContent={verseContent}
          onClose={handleCloseModal}
          isLoading={isVerseLoading}
        />
      </View>
    </ScrollView>
  );
} 