import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { SavedSermon } from '../../types/sermon';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { formatMillisToMMSS } from '../../utils/formatters';
import { ThemedText } from '../ThemedText';

// Define the Paragraph type
interface Paragraph {
  text: string;
  start: number;
  end: number;
}

interface TranscriptTabProps {
  sermon: SavedSermon;
  // Audio state props
  isLoading?: boolean;
  isLoaded?: boolean;
  isPlaying?: boolean;
  position?: number;
  duration?: number;
  // Audio control functions
  onTogglePlayback?: () => void;
  onSeek?: (position: number) => void;
  onSkipForward?: (milliseconds?: number) => void;
  onSkipBackward?: (milliseconds?: number) => void;
}

// Helper function to format time
const formatTime = (millis: number): string => {
  if (!millis || millis < 0) return '00:00';
  const totalSeconds = Math.floor(millis / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export function TranscriptTab({
  sermon,
  isLoading = false,
  isLoaded = false,
  isPlaying = false,
  position = 0,
  duration = 0,
  onTogglePlayback = () => {},
  onSeek = () => {},
  onSkipForward = () => {},
  onSkipBackward = () => {}
}: TranscriptTabProps) {
  const { colors, spacing, borderRadius, isLoading: isThemeLoading } = useTheme();
  const styles = createStyles(colors, spacing);
  
  // Early return if theme is loading
  if (isThemeLoading || !colors || !spacing || !borderRadius) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors?.primary || '#000000'} />
      </View>
    );
  }

  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Update slider position when not seeking
  useEffect(() => {
    if (!isSeeking && duration > 0) {
      setSliderValue(position / duration);
    }
  }, [position, duration, isSeeking]);

  // Handle paragraph click to seek
  const handleParagraphPress = useCallback((startTimeMillis: number) => {
    if (duration > 0 && isLoaded) {
      onSeek(startTimeMillis);
    } 
  }, [onSeek, duration, isLoaded]);

  // Render transcript paragraphs
  const renderParagraphs = () => {
    if (!sermon.transcript) {
      return (
        <View style={styles.centeredInfo}>
          <ThemedText variant="secondary">No transcript available for this sermon.</ThemedText>
        </View>
      );
    }

    let paragraphs: Paragraph[] = [];
    try {
      // Try to parse the transcript if it's stored as JSON
      const transcript = JSON.parse(sermon.transcript);
      paragraphs = transcript.paragraphs || [];
    } catch (e) {
      // If it's not valid JSON, split into sentences and add estimated timestamps
      const sentences = sermon.transcript
        .split('.')
        .filter(sentence => sentence.trim().length > 0)
        .map(sentence => sentence.trim());

      // Calculate estimated time per sentence
      const timePerSentence = duration / sentences.length;

      return (
        <ScrollView style={styles.transcriptContainer}>
          {sentences.map((sentence, index) => {
            const estimatedTime = Math.floor(timePerSentence * index);
            return (
              <TouchableOpacity 
                key={`s-${index}`}
                style={styles.paragraph}
                onPress={() => handleParagraphPress(estimatedTime)}
              >
                <ThemedText variant="primary">
                  {sentence + '.'}
                </ThemedText>
                <ThemedText 
                  variant="secondary" 
                  size="sm"
                  style={styles.paragraphTimestamp}
                >
                  {formatTime(estimatedTime)}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      );
    }

    if (paragraphs.length === 0) {
      return (
        <View style={styles.centeredInfo}>
          <ThemedText variant="secondary">
            No paragraphs found in the transcript.
          </ThemedText>
        </View>
      );
    }

    return (
      <ScrollView style={styles.transcriptContainer}>
        {paragraphs.map((paragraph, index) => (
          <TouchableOpacity 
            key={`p-${index}`}
            style={styles.paragraph}
            onPress={() => handleParagraphPress(paragraph.start)}
          >
            <ThemedText variant="primary">
              {paragraph.text}
            </ThemedText>
            <ThemedText 
              variant="secondary" 
              size="sm"
              style={styles.paragraphTimestamp}
            >
              {formatMillisToMMSS(paragraph.start)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Render player UI
  const renderPlayer = () => {
    if (isLoading) {
      return (
        <View style={styles.centeredInfo}>
          <ActivityIndicator size="small" color={colors.primary} />
          <ThemedText variant="secondary">Loading audio...</ThemedText>
        </View>
      );
    }

    if (!isLoaded) {
      return (
        <View style={styles.centeredInfo}>
          <ThemedText variant="secondary">No audio available for this sermon.</ThemedText>
        </View>
      );
    }

    const displayPositionMillis = isSeeking 
      ? sliderValue * duration 
      : position;
    const displayCurrentTime = formatTime(displayPositionMillis);
    const displayDuration = formatTime(duration);

    return (
      <View style={[
        styles.playerContainer,
        { 
          borderTopColor: colors.border || colors.text.secondary,
          backgroundColor: 'transparent',
        }
      ]}>
        <TouchableOpacity onPress={() => onSkipBackward(15000)} disabled={!isLoaded} style={styles.skipButton}>
          <Ionicons name="play-back" size={24} color={isLoaded ? colors.primary : colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onTogglePlayback} disabled={!isLoaded} style={styles.playPauseButton}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={32} color={isLoaded ? colors.primary : colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onSkipForward(15000)} disabled={!isLoaded} style={styles.skipButton}>
          <Ionicons name="play-forward" size={24} color={isLoaded ? colors.primary : colors.text.secondary} />
        </TouchableOpacity>

        <ThemedText variant="secondary" size="sm">{displayCurrentTime}</ThemedText>
        <Slider
          style={styles.slider}
          value={sliderValue}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.text.secondary}
          thumbTintColor={colors.primary}
          disabled={!isLoaded}
          onSlidingStart={() => setIsSeeking(true)}
          onValueChange={(value) => setSliderValue(value)} 
          onSlidingComplete={(value) => {
            setIsSeeking(false);
            onSeek(value * duration);
          }}
        />
        <ThemedText variant="secondary" size="sm">{displayDuration}</ThemedText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderParagraphs()}
      {renderPlayer()}
    </View>
  );
}

const createStyles = (colors: any, spacing: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transcriptContainer: {
    flex: 1,
    padding: spacing.sm,
  },
  paragraph: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.background.secondary,
  },
  paragraphTimestamp: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
  },
  centeredInfo: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    marginTop: spacing.sm,
  },
  skipButton: {
    padding: spacing.sm,
  },
  playPauseButton: {
    padding: spacing.sm,
    marginHorizontal: spacing.sm,
  },
  slider: {
    flex: 1,
    marginHorizontal: spacing.sm,
  },
}); 