import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { SavedSermon } from '../../types/sermon';
import { generateSermonSummary, StructuredSummary } from '../../services/openai';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { ThemedText } from '../ThemedText';
import { RouteProp } from '@react-navigation/native';

// Define params type
type SummaryTabParams = {
  SummaryTab: {
    sermon: SavedSermon;
  };
};

interface SummaryTabProps {
  sermon?: SavedSermon;
  route?: RouteProp<SummaryTabParams, 'SummaryTab'>;
}

export function SummaryTab({ sermon: propSermon, route }: SummaryTabProps) {
  const { colors, theme, fontWeight } = useThemeStyles();
  const [summary, setSummary] = useState<StructuredSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get sermon from either props or route params
  const routeParams = route?.params;
  const sermon = propSermon || routeParams?.sermon;
  
  console.log("SummaryTab - RENDERING NOW");
  console.log("SummaryTab - Sermon data:", sermon?.id);

  // Fetch summary when component mounts or sermon transcript changes
  useEffect(() => {
    const fetchSummary = async () => {
      if (!sermon?.transcript) {
        setError('No transcript available to summarize.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSummary(null);

      try {
        console.log(`[SummaryTab] Fetching summary for sermon ID: ${sermon.id}`);
        const generatedSummary = await generateSermonSummary(sermon.transcript);
        setSummary(generatedSummary);
        console.log(`[SummaryTab] Summary fetched successfully.`);
      } catch (err: any) {
        console.error(`[SummaryTab] Error fetching summary: ${err.message}`);
        setError(err.message || 'Could not generate summary.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [sermon?.id, sermon?.transcript]); // Depend on sermon ID and transcript

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.md,
      backgroundColor: colors.background.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionContainer: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.fontSizes.title,
      fontWeight: fontWeight('semiBold'),
      color: colors.text.primary,
      marginBottom: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.ui.border,
      paddingBottom: theme.spacing.xs,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'flex-start', // Align bullet and text at the top
      marginBottom: theme.spacing.sm,
    },
    bullet: {
      fontSize: theme.fontSizes.body,
      color: colors.text.secondary,
      marginRight: theme.spacing.sm,
      lineHeight: theme.lineHeights.body, // Match text line height
    },
    scriptureText: {
      fontSize: theme.fontSizes.body,
      color: colors.text.secondary,
      lineHeight: theme.lineHeights.body,
    },
    keyPointText: {
      flex: 1, // Allow text to wrap
      fontSize: theme.fontSizes.body,
      color: colors.text.primary,
      lineHeight: theme.lineHeights.body,
    },
  });

  // Render Logic
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ marginTop: theme.spacing.md }} color={colors.text.secondary}>
          Generating summary...
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        message={error}
        // Optionally add a retry button that calls fetchSummary again
      />
    );
  }

  if (!summary) {
    // This case might happen if the transcript was empty initially
    return (
      <View style={styles.container}>
        <ThemedText>No summary could be generated.</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Overview Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <ThemedText variant='body'>{summary.overview}</ThemedText>
      </View>

      {/* Scriptures Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Scriptures</Text>
        {summary.scriptures && summary.scriptures.length > 0 ? (
          summary.scriptures.map((scripture, index) => (
            <View key={`scripture-${index}`} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.scriptureText}>{scripture}</Text>
            </View>
          ))
        ) : (
          <ThemedText color={colors.text.secondary} style={{ fontStyle: 'italic' }}>
            No specific scriptures mentioned.
          </ThemedText>
        )}
      </View>

      {/* Key Points Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Key Points</Text>
        {summary.keyPoints && summary.keyPoints.length > 0 ? (
          summary.keyPoints.map((point, index) => (
            <View key={`point-${index}`} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.keyPointText}>{point}</Text>
            </View>
          ))
        ) : (
          <ThemedText color={colors.text.secondary} style={{ fontStyle: 'italic' }}>
            No specific key points identified.
          </ThemedText>
        )}
      </View>
    </ScrollView>
  );
} 