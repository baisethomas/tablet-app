import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { SavedSermon } from '../../types/sermon';
import { RouteProp } from '@react-navigation/native';

// Helper function to format milliseconds into MM:SS string
function formatMillis(millis: number | undefined): string {
  if (millis === undefined) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Define params type
type TranscriptTabParams = {
  TranscriptTab: {
    sermon: SavedSermon;
  };
};

interface TranscriptTabProps {
  sermon?: SavedSermon;
  route?: RouteProp<TranscriptTabParams, 'TranscriptTab'>;
}

export function TranscriptTab({ sermon: propSermon, route }: TranscriptTabProps) {
  // Call useThemeStyles at the top to get colors, fontSize, fontWeight
  const { colors, fontSize, fontWeight } = useThemeStyles(); 

  // Define useStyles hook INSIDE the component function
  const useStyles = () => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background.primary,
      },
      scrollContainer: {
        flex: 1,
      },
      scrollContent: {
        padding: 16,
        paddingBottom: 70, 
      },
      transcriptContainer: {
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
      },
      paragraph: {
        fontSize: fontSize.body,
        lineHeight: 28,
        marginBottom: 16,
        color: colors.text.primary,
        fontWeight: fontWeight('medium'),
      },
      emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      emptyText: {
        fontSize: fontSize.title,
        fontWeight: fontWeight('semiBold'),
        color: colors.primary,
        textAlign: 'center',
        backgroundColor: colors.background.secondary,
        padding: 16,
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      // --- Player Styles ---
      playerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth, 
        borderTopColor: colors.ui.border, 
        backgroundColor: colors.background.primary, 
      },
      playIcon: {
          fontSize: 24, 
          color: colors.primary,
          marginRight: 12, 
      },
      playerTimeText: {
          fontSize: fontSize.caption, 
          color: colors.text.secondary,
          minWidth: 40, 
          textAlign: 'center',
      },
      progressBarContainer: {
          flex: 1, 
          height: 6, 
          backgroundColor: colors.ui.lowEmphasis, 
          borderRadius: 3,
          marginHorizontal: 12,
          overflow: 'hidden',
      },
      progressBar: {
          height: '100%',
          backgroundColor: colors.primary,
      },
    });
  };
  // Now call useStyles AFTER it's defined and has access to colors etc.
  const styles = useStyles();

  // Get sermon from either props or route params
  const routeParams = route?.params;
  const sermon = propSermon || routeParams?.sermon;
  
  // --- Audio Playback State (Copied from AudioTab) --- 
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoadingSound, setIsLoadingSound] = useState(true); 

  // Derived state from status
  const isPlaying = status?.isLoaded && status.isPlaying;
  const positionMillis = status?.isLoaded ? status.positionMillis : 0;
  const durationMillis = status?.isLoaded ? status.durationMillis : 0;
  const progress = durationMillis ? positionMillis / durationMillis : 0;
  const currentTime = formatMillis(positionMillis);
  const duration = formatMillis(durationMillis);

  // Effect to load and unload sound (Copied from AudioTab)
  useEffect(() => {
    let soundObject: Audio.Sound | null = null;

    async function loadSound() {
      if (!sermon?.audioUrl) {
        setIsLoadingSound(false);
        setStatus({isLoaded: false});
        return;
      }

      setIsLoadingSound(true);
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        const { sound: loadedSound } = await Audio.Sound.createAsync(
          { uri: sermon.audioUrl },
          { shouldPlay: false },
          onPlaybackStatusUpdate 
        );
        soundObject = loadedSound;
        setSound(loadedSound);
      } catch (error: any) {
        setStatus({ isLoaded: false, error: `Failed to load audio: ${error.message || 'Unknown error'}` });
      } finally {
        setIsLoadingSound(false);
      }
    }

    loadSound();

    return () => {
      soundObject?.unloadAsync();
      setSound(null);
      setStatus(null);
    };
  }, [sermon?.audioUrl]);

  // Callback for playback status updates (Copied from AudioTab)
  const onPlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    if (!playbackStatus.isLoaded) {
      if (playbackStatus.error) {
      }
      setStatus(playbackStatus);
    } else {
      setStatus(playbackStatus);
      if (playbackStatus.didJustFinish) {
        sound?.setPositionAsync(0);
        sound?.pauseAsync();
      }
    }
  };
  
  // Function for play/pause button (Copied from AudioTab)
  const togglePlayback = async () => {
    if (!sound || !status?.isLoaded) return; 
    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        if (status.didJustFinish || positionMillis === durationMillis) {
            await sound.setPositionAsync(0);
        }
        await sound.playAsync();
      }
    } catch (error: any) {
    }
  };
  // --- End Audio Playback Logic --- 
  
  // --- Render Player UI --- 
  const renderPlayer = () => {
    // Don't render player if there's no audio URL
    if (!sermon?.audioUrl) return null;
    
    // Show loading indicator while sound prepares
    if (isLoadingSound) {
        return (
            <View style={styles.playerContainer}> 
                <ActivityIndicator color={colors.primary} /> {/* Use color from styles */}
                <Text style={styles.playerTimeText}> Loading...</Text> {/* Simpler loading text */}
            </View>
        );
    }

    // Show error if loading failed
    if (!status?.isLoaded && status?.error) {
        return (
            <View style={styles.playerContainer}>
                <Text style={[styles.playerTimeText, {color: colors.ui.error, flex: 1}]}>Error loading audio</Text> 
            </View>
        );
    }
    
    // Render the actual player controls
    return (
      <View style={styles.playerContainer}>
        <TouchableOpacity onPress={togglePlayback} disabled={!status?.isLoaded}>
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text> 
        </TouchableOpacity>
        <Text style={styles.playerTimeText}>{currentTime}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.playerTimeText}>{duration}</Text>
      </View>
    );
  }
  
  // Return empty state if no sermon data
  if (!sermon) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Unable to load sermon data. Please try again.</Text>
      </View>
    );
  }

  // Show placeholder if no transcript
  if (!sermon.transcript) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transcript available for this sermon.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.transcriptContainer}>
          <Text style={styles.paragraph}>{sermon.transcript}</Text>
        </View>
      </ScrollView>
      {/* Temporarily comment out player to isolate warning */}
      {/* {renderPlayer()} */}
    </View>
  );
} 