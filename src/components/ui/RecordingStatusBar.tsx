import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRecording } from '../../contexts/recording-context';
import { useThemeStyles } from '../../hooks/useThemeStyles';

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
  const { colors, theme, fontWeight } = useThemeStyles();
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
      backgroundColor: colors.background.secondary,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.ui.border,
      transform: [{ translateY }],
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },
    recordingIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.ui.error, // Red indicator
      marginRight: theme.spacing.sm,
    },
    statusText: {
      fontSize: theme.fontSizes.button,
      fontWeight: fontWeight('medium'),
      color: colors.text.primary,
      marginRight: theme.spacing.sm,
    },
    durationText: {
      fontSize: theme.fontSizes.button,
      fontWeight: fontWeight('regular'),
      color: colors.text.secondary,
      minWidth: 50, // Ensure space for MM:SS
    },
    controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    controlButton: {
      padding: theme.spacing.sm,
      marginLeft: theme.spacing.sm,
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
                <Ionicons name="stop-circle" size={28} color={colors.primary} />
              </TouchableOpacity>
            </>
          )}
          {/* Optionally show a dismiss button or info if there was a processing error? */}
        </View>
      </View>
    </Animated.View>
  );
} 