import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.error + '20',
          padding: spacing.lg,
          borderRadius: borderRadius.lg,
        }
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="alert-circle" size={24} color={colors.error} />
        <Text
          style={[
            styles.message,
            {
              color: colors.error,
              fontSize: typography.fontSize.md,
              marginLeft: spacing.md,
            }
          ]}
        >
          {message}
        </Text>
      </View>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={[
            styles.retryButton,
            {
              backgroundColor: colors.error,
              padding: spacing.sm,
              borderRadius: borderRadius.sm,
              marginTop: spacing.md,
            }
          ]}
        >
          <Text
            style={[
              styles.retryText,
              {
                color: colors.text.inverse,
                fontSize: typography.fontSize.sm,
              }
            ]}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    flex: 1,
  },
  retryButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  retryText: {
    fontWeight: '500',
  },
}); 