import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { SavedSermon } from '../../types/sermon';
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
  const { colors, fontSize, fontWeight } = useThemeStyles();
  
  // Get sermon from either props or route params
  const routeParams = route?.params;
  const sermon = propSermon || routeParams?.sermon;
  
  console.log("SummaryTab - RENDERING NOW");
  console.log("SummaryTab - Sermon data:", sermon?.id);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      padding: 20,
    },
    message: {
      fontSize: fontSize.heading,
      fontWeight: fontWeight('bold'),
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 20,
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
      width: '100%',
    },
    subtitle: {
      fontSize: fontSize.title,
      fontWeight: fontWeight('medium'),
      color: colors.text.secondary,
      textAlign: 'center',
      marginTop: 10,
      fontStyle: 'italic',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: fontSize.title,
      fontWeight: fontWeight('medium'),
      color: colors.primary,
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
    <View style={styles.container}>
      <Text style={styles.message}>AI-Generated Sermon Summary</Text>
      <Text style={styles.subtitle}>This feature is coming soon!</Text>
    </View>
  );
} 