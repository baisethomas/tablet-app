import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

// Global audio player manager to ensure only one sound plays at a time
class AudioManager {
  private static instance: AudioManager;
  private currentSound: Audio.Sound | null = null;
  private playbackStatus: AVPlaybackStatus | null = null;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public registerSound(sound: Audio.Sound | null): void {
    // If we already have a sound and are getting a new one, unload the old one
    if (this.currentSound && sound && this.currentSound !== sound) {
      console.log('[AudioManager] New sound registered, unloading previous sound');
      this.stopAndUnloadSound().catch(e => {
        console.error('[AudioManager] Error unloading previous sound:', e);
      });
    }
    
    this.currentSound = sound;
    console.log('[AudioManager] Sound registered:', sound ? 'Sound object' : 'null');
  }

  public updateStatus(status: AVPlaybackStatus | null): void {
    this.playbackStatus = status;
  }

  public async stopAndUnloadSound(): Promise<void> {
    if (!this.currentSound) return;

    const soundToUnload = this.currentSound;
    this.currentSound = null; // Clear reference before async operations

    try {
      // Only try to pause if we know the sound is loaded
      if (this.playbackStatus?.isLoaded) {
        if (this.playbackStatus.isPlaying) {
          console.log('[AudioManager] Pausing sound before unload');
          await soundToUnload.pauseAsync();
        }
      }
      
      console.log('[AudioManager] Unloading sound');
      await soundToUnload.unloadAsync();
      console.log('[AudioManager] Sound unloaded successfully');
    } catch (err) {
      console.error('[AudioManager] Error in stopAndUnloadSound:', err);
      // Try unload anyway as a last resort
      try {
        await soundToUnload.unloadAsync();
      } catch (e) {
        console.error('[AudioManager] Final error unloading sound:', e);
      }
    }
  }
}

// Helper to format time from milliseconds to MM:SS
function formatTime(millis: number): string {
  if (!millis || millis < 0) return '00:00';
  const totalSeconds = Math.floor(millis / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

interface AudioPlayerControls {
  isLoading: boolean;
  isLoaded: boolean;
  isPlaying: boolean;
  error: string | null;
  durationMillis: number;
  positionMillis: number;
  formattedDuration: string;
  formattedPosition: string;
  togglePlayback: () => void;
  pausePlayback: () => void;
  stopPlayback: () => void;
  seek: (position: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
}

export function useAudioPlayer(
  audioUrl: string | null | undefined,
  skipAmountMs: number = 15000
): AudioPlayerControls {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const audioManager = useRef(AudioManager.getInstance()).current;

  const isLoaded = status?.isLoaded ?? false;
  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const durationMillis = status?.isLoaded ? status.durationMillis ?? 0 : 0;
  const positionMillis = status?.isLoaded ? status.positionMillis ?? 0 : 0;
  const formattedDuration = formatTime(durationMillis);
  const formattedPosition = formatTime(positionMillis);

  // --- Playback Status Updates ---
  const onPlaybackStatusUpdate = useCallback((newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);
    audioManager.updateStatus(newStatus);
    
    if (newStatus.isLoaded) {
      setIsLoading(false);
      if (newStatus.didJustFinish) {
        if(sound) sound.setPositionAsync(0);
      }
    } else {
      if (newStatus.error) {
        console.error(`Playback Error: ${newStatus.error}`);
        setError(`Playback Error: ${newStatus.error}`);
        setIsLoading(false);
      }
    }
  }, [sound, audioManager]);

  // --- Load/Unload Sound ---
  useEffect(() => {
    isMountedRef.current = true;
    
    async function loadSound() {
      if (!audioUrl) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setStatus(null);
      setSound(null);

      // Configure Audio Mode for playback
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true, // Important for playback when silent switch is on
          staysActiveInBackground: false, // Keep false unless background audio is needed
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('[useAudioPlayer] Audio mode configured.');
      } catch (e: any) {
        console.error('[useAudioPlayer] Failed to set audio mode:', e);
        // Optionally set an error state here if mode setting fails
      }

      console.log('[useAudioPlayer] Loading sound:', audioUrl);
      try {
        const { sound: newSound, status: initialStatus } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false }, // Don't start playing automatically
          onPlaybackStatusUpdate // Attach status listener
        );
        if (isMountedRef.current) {
          console.log('[useAudioPlayer] Sound loaded');
          setSound(newSound);
          setStatus(initialStatus); // Set initial status right away
          audioManager.registerSound(newSound); // Register with audio manager
        } else {
          // If component unmounted during loading, unload sound
          newSound.unloadAsync().catch(e => {
            console.error('[useAudioPlayer] Error unloading sound after component unmounted:', e);
          });
        }
      } catch (e: any) {
        console.error('[useAudioPlayer] Error loading sound:', e);
        if (isMountedRef.current) {
          setError(e.message || 'Failed to load audio');
          setIsLoading(false);
        }
      }
    }

    loadSound();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      console.log('[useAudioPlayer] Component unmounting - notifying audio manager');
      // We don't need to unload directly here - audio manager will handle it when a new sound is registered
    };
  }, [audioUrl, onPlaybackStatusUpdate, audioManager]);

  // --- Controls ---
  const togglePlayback = useCallback(async () => {
    if (!sound || !status?.isLoaded) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  }, [sound, status, isPlaying]);

  const pausePlayback = useCallback(async () => {
    if (!sound || !status?.isLoaded || !isPlaying) return;
    await sound.pauseAsync();
  }, [sound, status, isPlaying]);

  const stopPlayback = useCallback(async () => {
    if (!sound) return;
    
    try {
      // Only attempt to pause/stop if we know the sound is loaded
      if (status?.isLoaded && isPlaying) {
        await sound.pauseAsync();
      }
      
      // Only attempt to set position if sound is loaded
      if (status?.isLoaded) {
        await sound.setPositionAsync(0);
        console.log('[useAudioPlayer] Playback stopped and position reset');
      } else {
        console.log('[useAudioPlayer] Sound not loaded, skipping stop operations');
      }
    } catch (err) {
      console.error('[useAudioPlayer] Error stopping playback:', err);
    }
  }, [sound, status, isPlaying]);

  const seek = useCallback(async (position: number) => {
    if (!sound || !status?.isLoaded) return;
    const seekMillis = position * durationMillis;
    await sound.setPositionAsync(seekMillis);
  }, [sound, status, durationMillis]);

  const skipForward = useCallback(async () => {
    if (!sound || !status?.isLoaded) return;
    const newPosition = Math.min(durationMillis, positionMillis + skipAmountMs);
    await sound.setPositionAsync(newPosition);
  }, [sound, status, durationMillis, positionMillis, skipAmountMs]);

  const skipBackward = useCallback(async () => {
    if (!sound || !status?.isLoaded) return;
    const newPosition = Math.max(0, positionMillis - skipAmountMs);
    await sound.setPositionAsync(newPosition);
  }, [sound, status, positionMillis, skipAmountMs]);

  // --- Return Controls and State ---
  return {
    isLoading,
    isLoaded,
    isPlaying,
    error,
    durationMillis,
    positionMillis,
    formattedDuration,
    formattedPosition,
    togglePlayback,
    pausePlayback,
    stopPlayback,
    seek,
    skipForward,
    skipBackward,
  };
} 