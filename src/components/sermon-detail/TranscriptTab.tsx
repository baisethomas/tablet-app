import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { SavedSermon } from '../../types/sermon';
import { RouteProp } from '@react-navigation/native';

// Define params type
type TranscriptTabParams = {
  TranscriptTab: {
    sermon: SavedSermon;
  };
};

interface TranscriptTabProps {
  sermon?: SavedSermon;
  route?: RouteProp<TranscriptTabParams, 'TranscriptTab'>;
}

export function TranscriptTab({ sermon: propSermon, route }: TranscriptTabProps) {
  const styles = useStyles();
  
  // Get sermon from either props or route params
  const routeParams = route?.params;
  const sermon = propSermon || routeParams?.sermon;
  
  console.log("TranscriptTab - Sermon data:", sermon?.id);
  console.log("TranscriptTab - Transcript:", sermon?.transcript || "No transcript available");

  // Return empty state if no sermon data
  if (!sermon) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Unable to load sermon data. Please try again.</Text>
      </View>
    );
  }

  // Show placeholder if no transcript
  if (!sermon.transcript) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transcript available for this sermon.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.transcriptContainer}>
          <Text style={styles.paragraph}>{sermon.transcript}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = () => {
  const { colors, fontSize, fontWeight } = useThemeStyles();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background.primary,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    scrollContent: {
      padding: 16,
    },
    transcriptContainer: {
      padding: 16,
      backgroundColor: colors.background.secondary,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    paragraph: {
      fontSize: fontSize.body,
      lineHeight: 28,
      marginBottom: 16,
      color: colors.text.primary,
      fontWeight: fontWeight('medium'),
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
}; 