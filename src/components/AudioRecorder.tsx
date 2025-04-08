import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

// Interface defines the callback when recording stops
interface AudioRecorderProps {
  onRecordingStop?: (fullAudioUri: string) => void;
}

// Configuration (Sample rate is still relevant for recording quality)
const SAMPLE_RATE = 16000;

export function AudioRecorder({ onRecordingStop }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false); // State for preparation phase

  const recordingRef = useRef<Audio.Recording | null>(null);
  const fullAudioUriRef = useRef<string | null>(null);

  // --- Cleanup Logic ---
  useEffect(() => {
    // Ensure recording is stopped and unloaded if component unmounts
    return () => {
      if (recordingRef.current) {
        console.log("AudioRecorder unmounting, ensuring recording is stopped.");
        recordingRef.current.stopAndUnloadAsync()
          .catch(e => console.error("Error stopping recording on unmount:", e));
        recordingRef.current = null;
      }
    };
  }, []);

  // --- Recording Logic ---

  const startRecording = async () => {
    try {
      if (isRecording) {
        console.warn('Already recording');
        return;
      }
      setError(null);
      setIsPreparing(true);

      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true, // Important for background capabilities?
        staysActiveInBackground: false, // Background recording might require more setup
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: SAMPLE_RATE,
          numberOfChannels: 1,
          bitRate: SAMPLE_RATE * 1 * 16,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: SAMPLE_RATE,
          numberOfChannels: 1,
          bitRate: SAMPLE_RATE * 1 * 16,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: SAMPLE_RATE * 1 * 16,
        }
      });

      recordingRef.current = recording;
      await recordingRef.current.startAsync();

      setIsPreparing(false);
      setIsRecording(true);
      console.log("Recording started");

    } catch (error: any) {
      console.error('Error starting recording:', error);
      setError(error.message || 'Failed to start recording');
      setIsPreparing(false);
      // Clean up potentially partially prepared recording
      if (recordingRef.current) {
        try { await recordingRef.current.stopAndUnloadAsync(); } catch (e) { /* ignore */ }
        recordingRef.current = null;
      }
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) {
      console.warn("Not recording, cannot stop.");
      return;
    }
    console.log("Stopping recording...");
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null; // Clear the ref

      if (!uri) {
        throw new Error('Failed to get recording URI after stopping.');
      }
      console.log("Recording stopped. URI:", uri);
      fullAudioUriRef.current = uri; // Store for potential cleanup if needed

      // Call the callback with the final URI
      onRecordingStop?.(uri);

    } catch (error: any) {
      console.error('Error stopping recording:', error);
      setError(error.message || 'Failed to stop recording');
      // Ensure ref is cleared even on error
      recordingRef.current = null;
    } finally {
      // Always reset recording state, even if callback fails
      setIsRecording(false);
      setIsPreparing(false);
    }
  };

  // --- UI Rendering ---
  function getButtonText() {
    if (isPreparing) return 'Preparing...';
    if (isRecording) return 'Stop Recording';
    return 'Start Recording';
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity
        style={[styles.button, (isRecording || isPreparing) && styles.recordingButton]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isPreparing} // Disable button while preparing
      >
        {isPreparing 
          ? <ActivityIndicator color="#FFFFFF" /> 
          : <Text style={styles.buttonText}>{getButtonText()}</Text>
        }
      </TouchableOpacity>
      {isRecording && <Text style={styles.statusText}>Recording...</Text>} 
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    // flex: 1, // Removed flex: 1 to allow parent control
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10, // Keep some vertical padding
    width: '100%', // Take full width
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30, // Give more horizontal space
    borderRadius: 8,
    minWidth: 200,
    minHeight: 50, // Ensure consistent height
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row', // For activity indicator
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 10,
    textAlign: 'center',
  },
  statusText: {
    marginTop: 10,
    color: '#555', // Use a neutral color
    fontSize: 14,
  },
}); 