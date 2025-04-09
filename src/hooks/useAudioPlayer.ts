import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

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
  seek: (position: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
}

export function useAudioPlayer(
  audioUrl: string | null | undefined,
  skipAmountMs: number = 15000 // Add optional parameter with default
): AudioPlayerControls {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isLoaded = status?.isLoaded ?? false;
  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const durationMillis = status?.isLoaded ? status.durationMillis ?? 0 : 0;
  const positionMillis = status?.isLoaded ? status.positionMillis ?? 0 : 0;
  const formattedDuration = formatTime(durationMillis);
  const formattedPosition = formatTime(positionMillis);

  // const skipAmount = 15000; // Remove hardcoded value

  // --- Playback Status Updates ---
  const onPlaybackStatusUpdate = useCallback((newStatus: AVPlaybackStatus) => {
    setStatus(newStatus);
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
  }, []);

  // --- Load/Unload Sound ---
  useEffect(() => {
    let isMounted = true;
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
        if (isMounted) {
          console.log('[useAudioPlayer] Sound loaded');
          setSound(newSound);
          setStatus(initialStatus); // Set initial status right away
          // setIsLoading(false); // Already handled by onPlaybackStatusUpdate
        }
      } catch (e: any) {
        console.error('[useAudioPlayer] Error loading sound:', e);
        if (isMounted) {
          setError(e.message || 'Failed to load audio');
          setIsLoading(false);
        }
      }
    }

    loadSound();

    // Cleanup function
    return () => {
      isMounted = false;
      console.log('[useAudioPlayer] Unloading sound...');
      sound?.unloadAsync();
    };
  }, [audioUrl, onPlaybackStatusUpdate]); // Rerun when URL changes

  // --- Controls ---
  const togglePlayback = useCallback(async () => {
    if (!sound || !status?.isLoaded) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
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
    seek,
    skipForward,
    skipBackward,
  };
} 