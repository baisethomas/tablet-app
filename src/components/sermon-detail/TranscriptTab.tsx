import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { SavedSermon } from '../../types/sermon';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { formatMillisToMMSS } from '../../utils/formatters';
import { Paragraph } from '../../services/assemblyai';

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

  // --- Click Handler for Paragraphs ---
  const handleParagraphPress = useCallback((startTimeMillis: number) => {
    if (durationMillis > 0) {
        const seekPositionRatio = startTimeMillis / durationMillis;
        seek(seekPositionRatio); // Call seek from the audio hook
        // Optionally force playback to start if paused?
        // if (!isPlaying) { togglePlayback(); } 
    } 
  }, [seek, durationMillis]);

  // --- Render Transcript Content ---
  const renderTranscript = () => {
    // Check if processing failed or is ongoing
    if (sermon?.processingStatus === 'error') {
        return <Text style={styles.transcriptText}>Error during processing: {sermon.processingError || 'Unknown error'}</Text>;
    }
    if (sermon?.processingStatus === 'processing') {
        return <Text style={styles.transcriptText}>Transcript processing...</Text>;
    }
    
    // Check for structured transcript data
    const paragraphs = sermon?.transcriptData?.paragraphs;
    if (paragraphs && Array.isArray(paragraphs) && paragraphs.length > 0) {
      return paragraphs.map((para, index) => (
        <TouchableOpacity 
          key={index} 
          onPress={() => handleParagraphPress(para.start)} 
          activeOpacity={0.7}
          style={styles.paragraphContainer}
        >
          <Text style={styles.timestampText}>
            [{formatMillisToMMSS(para.start)}]
          </Text>
          <Text style={styles.paragraphText}>
            {/* Add speaker label if available: {para.speaker ? `Speaker ${para.speaker}: ` : ''} */}
            {para.text}
          </Text>
        </TouchableOpacity>
      ));
    }

    // Fallback to plain transcript text if no structured data
    const plainTranscript = sermon?.transcript;
    if (plainTranscript) {
        return <Text style={styles.transcriptText}>{plainTranscript}</Text>;
    }
    
    // Default message if no transcript at all
    return <Text style={styles.transcriptText}>No transcript available.</Text>;
  };

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
      paddingHorizontal: theme.spacing.md,
    },
    transcriptText: {
      fontSize: theme.fontSizes.body,
      lineHeight: theme.lineHeights.body * 1.4,
      color: colors.text.primary,
      paddingVertical: theme.spacing.md,
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
      minWidth: 45,
      textAlign: 'center',
      marginHorizontal: theme.spacing.xs,
    },
    slider: {
      flex: 1,
      height: 40,
    },
    centeredInfo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    loadingText: {
        marginTop: theme.spacing.sm,
        fontSize: theme.fontSizes.body,
        color: colors.text.secondary,
    },
    paragraphContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    timestampText: {
      fontSize: theme.fontSizes.caption,
      color: colors.text.secondary,
      marginRight: theme.spacing.sm,
      lineHeight: theme.lineHeights.body * 1.4,
    },
    paragraphText: {
      flex: 1,
      fontSize: theme.fontSizes.body,
      lineHeight: theme.lineHeights.body * 1.4, 
      color: colors.text.primary,
    },
  });

  // --- Main Render ---
  return (
    <View style={styles.container}>
      <ScrollView style={styles.transcriptContainer}>
        {renderTranscript()} 
      </ScrollView>
      {renderPlayer()}
    </View>
  );
} 