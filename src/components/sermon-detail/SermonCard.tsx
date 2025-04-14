import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { SavedSermon } from '../../types/sermon';

interface SermonCardProps {
  sermon: SavedSermon;
  onPress: () => void;
  onDelete: () => void;
}

export function SermonCard({ sermon, onPress, onDelete }: SermonCardProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.background.primary,
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          marginBottom: spacing.md,
        }
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text.primary,
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
            }
          ]}
          numberOfLines={1}
        >
          {sermon.title || 'Untitled'}
        </Text>
        <TouchableOpacity onPress={onDelete}>
          <Ionicons name="trash-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <Text
        style={[
          styles.date,
          {
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
            marginTop: spacing.xs,
          }
        ]}
      >
        {formatDate(sermon.date)}
      </Text>

      {sermon.type === 'note' ? (
        <Text
          style={[
            styles.content,
            {
              color: colors.text.primary,
              fontSize: typography.fontSize.md,
              marginTop: spacing.md,
            }
          ]}
          numberOfLines={2}
        >
          {sermon.notes}
        </Text>
      ) : (
        <View style={styles.recordingInfo}>
          <Ionicons
            name="time-outline"
            size={16}
            color={colors.text.secondary}
          />
          <Text
            style={[
              styles.duration,
              {
                color: colors.text.secondary,
                fontSize: typography.fontSize.sm,
                marginLeft: spacing.xs,
              }
            ]}
          >
            {sermon.durationMillis
              ? `${Math.floor(sermon.durationMillis / 60000)} min`
              : 'Processing...'}
          </Text>
        </View>
      )}

      {sermon.processingStatus === 'processing' && (
        <View
          style={[
            styles.processingIndicator,
            {
              backgroundColor: colors.primary + '20',
              padding: spacing.sm,
              borderRadius: borderRadius.sm,
              marginTop: spacing.md,
            }
          ]}
        >
          <ActivityIndicator size="small" color={colors.primary} />
          <Text
            style={[
              styles.processingText,
              {
                color: colors.primary,
                fontSize: typography.fontSize.sm,
                marginLeft: spacing.sm,
              }
            ]}
          >
            Processing...
          </Text>
        </View>
      )}

      {sermon.processingError && (
        <View
          style={[
            styles.errorContainer,
            {
              backgroundColor: colors.error + '20',
              padding: spacing.sm,
              borderRadius: borderRadius.sm,
              marginTop: spacing.md,
            }
          ]}
        >
          <Ionicons name="alert-circle" size={16} color={colors.error} />
          <Text
            style={[
              styles.errorText,
              {
                color: colors.error,
                fontSize: typography.fontSize.sm,
                marginLeft: spacing.sm,
              }
            ]}
          >
            Error processing audio
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  date: {
    marginTop: 4,
  },
  content: {
    marginTop: 8,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  duration: {
    marginLeft: 4,
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  processingText: {
    marginLeft: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    marginLeft: 4,
  },
}); 