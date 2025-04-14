import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useRoute } from '@react-navigation/core';
import type { RouteProp } from '@react-navigation/core';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { ThemedText } from '../components/ThemedText';
import { SummaryTab } from '../components/sermon-detail/SummaryTab';
import { TranscriptTab } from '../components/sermon-detail/TranscriptTab';
import { NotesTab } from '../components/sermon-detail/NotesTab';
import { SavedSermon } from '../types/sermon';
import { getSermonById, updateSermon } from '../services/sermon-storage';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { RootStackParamList } from '../types/navigation';
import { formatMillisToMMSS } from '../utils/formatters';

type TabType = 'summary' | 'transcript' | 'notes';

export function SermonDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'SermonDetail'>>();
  const { sermonId } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const { colors, spacing, typography } = useTheme();
  const [sermon, setSermon] = useState<SavedSermon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Audio state
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const titleInputRef = useRef<TextInput>(null);

  // Fetch sermon data when component mounts or sermonId changes
  useEffect(() => {
    async function loadSermonData() {
      console.log(`[SermonDetailScreen] Loading sermon with ID: ${sermonId}`);
      setIsLoading(true);
      setError(null);
      
      try {
        if (!sermonId) {
          throw new Error('Invalid sermon ID');
        }
        
        const fetchedSermon = await getSermonById(sermonId);
        
        if (!fetchedSermon) {
          console.error(`[SermonDetailScreen] Sermon with ID ${sermonId} not found`);
          setError('Sermon not found');
        } else {
          console.log(`[SermonDetailScreen] Successfully loaded sermon: ${fetchedSermon.id}`);
          setSermon(fetchedSermon);
        }
      } catch (err: any) {
        console.error('[SermonDetailScreen] Error loading sermon:', err);
        setError(err.message || 'Failed to load sermon');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSermonData();
  }, [sermonId]);

  // Load audio when sermon is loaded
  useEffect(() => {
    if (!sermon) return;
    const audioUrl = sermon.audioUrl;
    if (!audioUrl) return;

    const loadAudio = async () => {
      try {
        setIsAudioLoading(true);
        
        // Configure audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl as string },
          { shouldPlay: false },
          onPlaybackStatusUpdate,
          true
        );
        setSound(newSound);
        setIsAudioLoaded(true);
      } catch (error) {
        console.error('Error loading audio:', error);
        setError('Failed to load audio');
      } finally {
        setIsAudioLoading(false);
      }
    };

    loadAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sermon?.audioUrl]); // Only reload when audio URL changes
  
  // Playback status update handler
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    
    setIsPlaying(status.isPlaying);
    setPlaybackPosition(status.positionMillis);
    setPlaybackDuration(status.durationMillis || 0);
    
    if (status.didJustFinish) {
      // Reset position when finished
      sound?.setPositionAsync(0);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    // If leaving transcript tab, pause audio
    if (activeTab === 'transcript' && tab !== 'transcript') {
      pausePlayback();
    }
    
    setActiveTab(tab);
  };
  
  // Audio control functions
  const togglePlayback = async () => {
    if (!sound || !isAudioLoaded) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };
  
  const pausePlayback = async () => {
    if (!sound || !isAudioLoaded || !isPlaying) return;
    await sound.pauseAsync();
  };
  
  const seekTo = async (position: number) => {
    if (!sound || !isAudioLoaded) return;
    await sound.setPositionAsync(position);
  };
  
  const skipForward = async (milliseconds = 15000) => {
    if (!sound || !isAudioLoaded) return;
    const newPosition = Math.min(playbackDuration, playbackPosition + milliseconds);
    await sound.setPositionAsync(newPosition);
  };
  
  const skipBackward = async (milliseconds = 15000) => {
    if (!sound || !isAudioLoaded) return;
    const newPosition = Math.max(0, playbackPosition - milliseconds);
    await sound.setPositionAsync(newPosition);
  };

  const handleUpdateSermon = async (updatedSermon: SavedSermon) => {
    try {
      const result = await updateSermon(updatedSermon.id, { notes: updatedSermon.notes });
      setSermon(result);
    } catch (err) {
      console.error('[SermonDetailScreen] Error updating sermon:', err);
      setError('Failed to update sermon');
    }
  };

  // Add title update handler
  const handleTitleUpdate = async (newTitle: string) => {
    try {
      if (!sermon) return;
      const result = await updateSermon(sermon.id, { title: newTitle.trim() });
      setSermon(result);
      setIsEditingTitle(false);
    } catch (err) {
      console.error('[SermonDetailScreen] Error updating sermon title:', err);
      setError('Failed to update sermon title');
    }
  };

  // Start editing handler
  const startTitleEdit = () => {
    setEditedTitle(sermon?.title || '');
    setIsEditingTitle(true);
    // Focus the input on the next render
    setTimeout(() => titleInputRef.current?.focus(), 100);
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { 
        backgroundColor: colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center'
      }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText 
          variant="secondary" 
          style={{ marginTop: spacing.md }}
        >
          Loading sermon...
        </ThemedText>
      </View>
    );
  }

  // Show error state
  if (error || !sermon) {
    return (
      <View style={[styles.container, { 
        backgroundColor: colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg
      }]}>
        <ErrorDisplay 
          message={error || 'Sermon not found'} 
          onRetry={() => setIsLoading(true)} 
        />
      </View>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'summary':
        return <SummaryTab sermon={sermon} />;
      case 'transcript':
        return (
          <TranscriptTab 
            sermon={sermon}
            isPlaying={isPlaying}
            isLoading={isAudioLoading}
            isLoaded={isAudioLoaded}
            position={playbackPosition}
            duration={playbackDuration}
            onTogglePlayback={togglePlayback}
            onSeek={seekTo}
            onSkipForward={skipForward}
            onSkipBackward={skipBackward}
          />
        );
      case 'notes':
        return <NotesTab sermon={sermon} onUpdate={handleUpdateSermon} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <TouchableOpacity 
        style={[styles.titleContainer, { 
          backgroundColor: colors.background.primary,
          padding: spacing.md,
          paddingBottom: spacing.sm,
        }]}
        onPress={startTitleEdit}
      >
        {isEditingTitle ? (
          <TextInput
            ref={titleInputRef}
            value={editedTitle}
            onChangeText={setEditedTitle}
            style={[styles.titleInput, { 
              color: colors.text.primary,
              fontSize: 24,
              fontWeight: 'bold',
            }]}
            placeholder="Enter title"
            placeholderTextColor={colors.text.secondary}
            onBlur={() => {
              if (editedTitle.trim() !== sermon?.title) {
                handleTitleUpdate(editedTitle);
              } else {
                setIsEditingTitle(false);
              }
            }}
            onSubmitEditing={() => {
              if (editedTitle.trim() !== sermon?.title) {
                handleTitleUpdate(editedTitle);
              } else {
                setIsEditingTitle(false);
              }
            }}
          />
        ) : (
          <View style={styles.titleRow}>
            <ThemedText 
              variant="primary" 
              weight="bold"
              style={{ fontSize: 24 }}
            >
              {sermon.title || 'Untitled Note'}
            </ThemedText>
            <Ionicons 
              name="pencil" 
              size={16} 
              color={colors.text.secondary}
              style={{ marginLeft: spacing.sm }}
            />
          </View>
        )}
      </TouchableOpacity>

      <View style={[styles.metadataContainer, { 
        borderBottomColor: colors.border || colors.text.secondary,
        backgroundColor: colors.background.primary,
        padding: spacing.md,
      }]}>
        <View style={[styles.metadataRow, { gap: spacing.md }]}>
          <View style={[styles.metadataItem, { gap: spacing.xs }]}>
            <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
            <ThemedText 
              variant="secondary" 
              style={{ ...styles.metadataText, color: colors.text.secondary }}
            >
              {new Date(sermon.date).toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'numeric',
                day: 'numeric',
              })} · {new Date(sermon.date).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </ThemedText>
          </View>
          <View style={[styles.metadataItem, { gap: spacing.xs }]}>
            <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
            <ThemedText 
              variant="secondary" 
              style={{ ...styles.metadataText, color: colors.text.secondary }}
            >
              {formatMillisToMMSS(sermon.durationMillis || 0)}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.tabBar}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('summary')}
          >
            <ThemedText
              variant={activeTab === 'summary' ? 'primary' : 'secondary'}
              weight={activeTab === 'summary' ? 'bold' : 'regular'}
              style={styles.tabText}
            >
              Summary
            </ThemedText>
            {activeTab === 'summary' && <View style={[styles.indicator, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('transcript')}
          >
            <ThemedText
              variant={activeTab === 'transcript' ? 'primary' : 'secondary'}
              weight={activeTab === 'transcript' ? 'bold' : 'regular'}
              style={styles.tabText}
            >
              Transcript
            </ThemedText>
            {activeTab === 'transcript' && <View style={[styles.indicator, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('notes')}
          >
            <ThemedText
              variant={activeTab === 'notes' ? 'primary' : 'secondary'}
              weight={activeTab === 'notes' ? 'bold' : 'regular'}
              style={styles.tabText}
            >
              Notes
            </ThemedText>
            {activeTab === 'notes' && <View style={[styles.indicator, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {renderTab()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 12,
    flex: 1,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    letterSpacing: 0.3,
  },
  indicator: {
    position: 'absolute',
    bottom: -1,
    height: 3,
    width: '60%',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
  },
  metadataContainer: {
    borderBottomWidth: 1,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 14,
  },
  titleContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleInput: {
    padding: 0,
    margin: 0,
  },
}); 