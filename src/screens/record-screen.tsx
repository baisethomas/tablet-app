import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ThemedText } from '../components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useRecording } from '../contexts/recording-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function RecordScreen() {
  const { colors, createThemedStyles, typography, spacing } = useTheme();
  const { 
    isRecording, isPaused, recordingDurationMillis, 
    startRecording, pauseRecording, resumeRecording, stopRecordingAndProcess,
    isProcessing, error
  } = useRecording();
  const insets = useSafeAreaInsets();

  // Format time from milliseconds
  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const styles = createThemedStyles((colors) => ({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    durationText: {
      fontSize: typography.fontSize.xxl,
      fontFamily: 'monospace',
      marginBottom: spacing.xl,
    },
    controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    recordButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isRecording ? colors.error : colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: spacing.md,
    },
    secondaryButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusText: {
      marginTop: spacing.lg,
    },
    processingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: spacing.sm,
      marginTop: spacing.lg,
    },
    processingText: {
      marginLeft: spacing.sm,
    },
    errorText: {
      color: colors.error,
      marginTop: spacing.md,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
    }
  }));

  // Show processing state
  if (isProcessing) {
    return (
      <View style={styles.container}>
        <ThemedText variant="primary">
          Processing your recording...
        </ThemedText>
        <View style={styles.processingContainer}>
          <Ionicons name="hourglass-outline" size={24} color={colors.text.primary} />
          <ThemedText variant="secondary" style={styles.processingText}>
            This may take a few moments
          </ThemedText>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={50} color={colors.error} />
        <ThemedText variant="primary" style={styles.errorText}>
          {error}
        </ThemedText>
        <TouchableOpacity 
          style={[styles.recordButton, { marginTop: spacing.lg }]} 
          onPress={startRecording}
        >
          <Ionicons name="refresh" size={30} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText 
        variant="primary" 
        style={styles.durationText}
      >
        {formatDuration(recordingDurationMillis)}
      </ThemedText>

      <View style={styles.controlsContainer}>
        {isRecording ? (
          <>
            {isPaused ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={resumeRecording}>
                <Ionicons name="play" size={30} color={colors.text.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.secondaryButton} onPress={pauseRecording}>
                <Ionicons name="pause" size={30} color={colors.text.primary} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.recordButton} onPress={stopRecordingAndProcess}>
              <Ionicons name="stop" size={30} color={colors.text.inverse} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
            <Ionicons name="mic" size={40} color={colors.text.inverse} />
          </TouchableOpacity>
        )}
      </View>

      <ThemedText variant="secondary" style={styles.statusText}>
        {isRecording 
          ? isPaused 
            ? 'Recording paused' 
            : 'Recording in progress...' 
          : 'Tap to start recording'}
      </ThemedText>
    </View>
  );
} 