import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { SavedSermon } from '../../types/sermon';
import { RouteProp } from '@react-navigation/native';

// Define params type
type AudioTabParams = {
  AudioTab: {
    sermon: SavedSermon;
  };
};

interface AudioTabProps {
  sermon?: SavedSermon;
  route?: RouteProp<AudioTabParams, 'AudioTab'>;
}

export function AudioTab({ sermon: propSermon, route }: AudioTabProps) {
  const { colors, fontSize, fontWeight } = useThemeStyles();
  
  // Get sermon from either props or route params
  const routeParams = route?.params;
  const sermon = propSermon || routeParams?.sermon;
  
  // Track audio playback state (mock implementation)
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState('0:00');
  const [duration, setDuration] = React.useState('0:00');
  
  // Mock function for play button
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background.primary,
    },
    audioPlayerContainer: {
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    progressBarContainer: {
      marginVertical: 20,
      height: 6,
      backgroundColor: `${colors.primary}40`,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      width: `${progress * 100}%`,
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    timeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    timeText: {
      fontSize: fontSize.caption,
      color: colors.text.secondary,
      fontWeight: fontWeight('medium'),
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginTop: 24,
    },
    playButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 5,
    },
    playIcon: {
      fontSize: 30,
      color: colors.text.inverse,
    },
    actionButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionIcon: {
      fontSize: 24,
      color: colors.text.secondary,
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
    sermonTitle: {
      fontSize: fontSize.heading,
      fontWeight: fontWeight('bold'),
      color: colors.text.primary,
      marginBottom: 8,
    },
    sermonSpeaker: {
      fontSize: fontSize.body,
      fontWeight: fontWeight('medium'),
      color: colors.text.secondary,
      marginBottom: 16,
    },
  });
  
  // Return empty state if no sermon data
  if (!sermon) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Unable to load sermon audio. Please try again.</Text>
      </View>
    );
  }

  // Show placeholder if no audio
  if (!sermon.audioUrl) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No audio available for this sermon.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.audioPlayerContainer}>
        <Text style={styles.sermonTitle}>{sermon.title}</Text>
        <Text style={styles.sermonSpeaker}>{sermon.speaker}</Text>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar} />
        </View>
        
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{currentTime}</Text>
          <Text style={styles.timeText}>{duration}</Text>
        </View>
        
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>⏮</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>⏭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
} 