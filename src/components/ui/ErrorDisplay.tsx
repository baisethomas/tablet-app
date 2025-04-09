import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStyles } from '../../hooks/useThemeStyles';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  const { colors, theme, fontWeight } = useThemeStyles();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
      backgroundColor: colors.background.primary,
    },
    iconContainer: {
      marginBottom: theme.spacing.md,
    },
    errorMessage: {
      fontSize: theme.fontSizes.body,
      color: colors.ui.error,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    retryButton: {
      backgroundColor: colors.background.secondary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.ui.border,
    },
    retryButtonText: {
      fontSize: theme.fontSizes.button,
      color: colors.primary,
      fontWeight: fontWeight('medium'),
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name="alert-circle-outline" 
          size={48} 
          color={colors.ui.error} 
        />
      </View>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
} 