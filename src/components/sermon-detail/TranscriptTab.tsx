import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { SavedSermon } from '../../types/sermon';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { ErrorDisplay } from '../ui/ErrorDisplay';

interface TranscriptTabProps {
  sermon?: SavedSermon; 
}

export function TranscriptTab({ sermon }: TranscriptTabProps) {
  const { colors, fontWeight, theme } = useThemeStyles();
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Use the audio player hook
  const {
    isLoading: isPlayerLoading,
    isLoaded,
    isPlaying,
    error: playerError,
    durationMillis,
    positionMillis,
    formattedDuration,
    formattedPosition,
    togglePlayback,
    seek,
    skipForward,
    skipBackward,
  } = useAudioPlayer(sermon?.audioUrl);

  // Update slider position when not seeking
  useEffect(() => {
    if (!isSeeking && durationMillis > 0) {
      setSliderValue(positionMillis / durationMillis);
    }
  }, [positionMillis, durationMillis, isSeeking]);

  // --- Render Player UI --- 
  const renderPlayer = () => {
    if (isPlayerLoading) {
      return (
        <View style={styles.centeredInfo}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading audio...</Text>
        </View>
      );
    }

    if (playerError) {
      return (
        <ErrorDisplay 
          message={playerError} 
          // Optionally add retry for audio loading
        />
      );
    }
    
    if (!sermon?.audioUrl) {
         return (
             <View style={styles.centeredInfo}>
                <Text style={styles.loadingText}>No audio available for this sermon.</Text>
             </View>
         );
    }

    // Calculate display time based on seeking state
    const displayPositionMillis = isSeeking 
      ? sliderValue * durationMillis 
      : positionMillis;
    const displayCurrentTime = formatTime(displayPositionMillis);

    return (
      <View style={styles.playerContainer}>
        <TouchableOpacity onPress={skipBackward} disabled={!isLoaded} style={styles.skipButton}>
          <Ionicons name="play-back" size={24} color={isLoaded ? colors.primary : colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayback} disabled={!isLoaded} style={styles.playPauseButton}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={32} color={isLoaded ? colors.primary : colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={skipForward} disabled={!isLoaded} style={styles.skipButton}>
          <Ionicons name="play-forward" size={24} color={isLoaded ? colors.primary : colors.text.tertiary} />
        </TouchableOpacity>

        <Text style={[styles.playerTimeText, { color: colors.text.secondary }]}>{displayCurrentTime}</Text>
        <Slider
          style={styles.slider}
          value={sliderValue}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.text.tertiary}
          thumbTintColor={colors.primary}
          disabled={!isLoaded}
          onSlidingStart={() => setIsSeeking(true)}
          onValueChange={(value) => setSliderValue(value)} 
          onSlidingComplete={(value) => {
            setIsSeeking(false);
            seek(value); // Seek using the hook's function
          }}
        />
        <Text style={[styles.playerTimeText, { color: colors.text.secondary }]}>{formattedDuration}</Text>
      </View>
    );
  }
  
  // Helper to format time (can be moved to hook or utils)
  function formatTime(millis: number): string {
      if (!millis || millis < 0) return '00:00';
      const totalSeconds = Math.floor(millis / 1000);
      const seconds = totalSeconds % 60;
      const minutes = Math.floor(totalSeconds / 60);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // --- Styles ---
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    transcriptContainer: {
      flex: 1,
      padding: theme.spacing.md,
    },
    transcriptText: {
      fontSize: theme.fontSizes.body,
      lineHeight: theme.lineHeights.body * 1.4, // Increase line height for readability
      color: colors.text.primary,
    },
    playerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.ui.border,
      backgroundColor: colors.background.secondary,
    },
    playPauseButton: {
      paddingHorizontal: theme.spacing.sm,
    },
    skipButton: {
      paddingHorizontal: theme.spacing.sm,
    },
    playerTimeText: {
      fontSize: theme.fontSizes.caption,
      minWidth: 45, // Ensure space for MM:SS
      textAlign: 'center',
      marginHorizontal: theme.spacing.xs,
    },
    slider: {
      flex: 1,
      height: 40,
    },
    centeredInfo: {
        flex: 1, // Takes up transcript space when shown
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    loadingText: {
        marginTop: theme.spacing.sm,
        fontSize: theme.fontSizes.body,
        color: colors.text.secondary,
    },
  });

  // --- Main Render ---
  return (
    <View style={styles.container}>
      <ScrollView style={styles.transcriptContainer}>
        <Text style={styles.transcriptText}>
          {sermon?.transcript || 'No transcript available.'}
        </Text>
      </ScrollView>
      {renderPlayer()}
    </View>
  );
} 