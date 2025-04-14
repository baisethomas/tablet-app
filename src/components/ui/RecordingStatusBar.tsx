import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRecording } from '../../contexts/recording-context';
import { useTheme } from '../../hooks/useTheme';

// Helper to format time from milliseconds
function formatDuration(millis: number): string {
  const totalSeconds = Math.floor(millis / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function RecordingStatusBar() {
  const { 
    isRecording, 
    isPaused, 
    recordingDurationMillis, 
    pauseRecording, 
    resumeRecording, 
    stopRecordingAndProcess, 
    isProcessing, // Added for potential processing indicator
    error 
  } = useRecording();
  const { colors, typography, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isRecording ? 1 : 0,
      duration: 300,
      useNativeDriver: true, // Use native driver for transform
    }).start();
  }, [isRecording]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0], // Start off-screen (adjust as needed)
  });

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: insets.bottom, // Handle safe area
      backgroundColor: colors.error + '20',
      borderRadius: borderRadius.lg,
      transform: [{ translateY }],
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },
    recordingIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4, // Fixed value for circular shape
      backgroundColor: colors.error,
      marginRight: spacing.sm,
    },
    statusText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '500',
      color: colors.error,
      marginLeft: spacing.sm,
    },
    durationText: {
      fontSize: typography.fontSize.sm,
      fontFamily: 'monospace',
      color: colors.text.secondary,
    },
    controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    controlButton: {
      padding: spacing.sm,
      marginLeft: spacing.sm,
    },
  });

  // Simplified visibility logic for now - render if recording OR processing
  if (!isRecording && !isProcessing) {
    // To prevent flash, we render the container but let animation hide it
    // A more robust approach might wait for animation completion
    // return null;
  }

  // Determine status text
  let statusTextContent = 'Recording...';
  if (isPaused) statusTextContent = 'Paused';
  if (isProcessing) statusTextContent = 'Processing...';
  // Show error state if processing finished with an error
  if (!isProcessing && error) statusTextContent = 'Error Processing';

  return (
    <Animated.View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          {/* Show indicator only if actually recording and not paused */}
          {isRecording && !isPaused && !isProcessing && !error && (
            <View style={styles.recordingIndicator} />
          )}
          {/* Show processing/error indicator? maybe an icon instead of text */}
          <Text style={styles.statusText} numberOfLines={1}>
            {statusTextContent}
          </Text>
          {/* Show duration only if recording/paused */}
          {isRecording && !isProcessing && !error && (
            <Text style={styles.durationText}>
              {formatDuration(recordingDurationMillis)}
            </Text>
          )}
        </View>

        <View style={styles.controlsContainer}>
          {/* Show controls only if recording/paused, NOT during processing/error */}
          {isRecording && !isProcessing && !error && (
            <>
              {!isPaused ? (
                <TouchableOpacity style={styles.controlButton} onPress={pauseRecording}>
                  <Ionicons name="pause" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.controlButton} onPress={resumeRecording}>
                  <Ionicons name="play" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.controlButton} onPress={stopRecordingAndProcess}>
                <Ionicons name="stop" size={24} color={colors.text.inverse} />
              </TouchableOpacity>
            </>
          )}
          {/* Optionally show a dismiss button or info if there was a processing error? */}
        </View>
      </View>
    </Animated.View>
  );
} 