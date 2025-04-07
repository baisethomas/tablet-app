import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
// Import base-64 using require if standard import fails with bundler
const base64 = require('base-64');

interface AudioRecorderProps {
  onTranscriptionUpdate?: (text: string, isFinal: boolean) => void;
}

// AssemblyAI Real-time Configuration
const ASSEMBLYAI_WS_URL = 'wss://api.assemblyai.com/v2/realtime/ws';
const SAMPLE_RATE = 16000; // Must match recording settings
const RECORDING_INTERVAL_MS = 1000; // *** REDUCED INTERVAL *** How often to send chunks

export function AudioRecorder({ onTranscriptionUpdate }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalizedTranscript, setFinalizedTranscript] = useState('');
  const [currentPartialTranscript, setCurrentPartialTranscript] = useState('');

  const websocketRef = useRef<WebSocket | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const apiKey = Constants.expoConfig?.extra?.ASSEMBLYAI_API_KEY;
  const stopTriggeredByUser = useRef(false); // Ref to track if stop was intentional

  // *** Ref to track the latest isListening state for the interval closure ***
  const isListeningRef = useRef(isListening);
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // --- Cleanup Logic ---
  useEffect(() => {
    return () => {
      // Cleanup function should be synchronous
      stopRealtimeTranscription();
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // --- WebSocket and Recording Logic ---

  const startRealtimeTranscription = async () => {
    try {
      if (isListening) {
        console.warn('[DEBUG] Already listening');
        return;
      }

      setIsRecording(true);
      setIsConnecting(true);

      // Reset transcripts on start
      setFinalizedTranscript('');
      setCurrentPartialTranscript('');

      // First, set up the audio session
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('[DEBUG] Error configuring audio session:', error);
        throw new Error('Failed to configure audio session');
      }

      // Then request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted');
      }

      console.log('[DEBUG] Audio permissions granted');

      setIsListening(true);
      setError(null);

      const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expires_in: 3600 }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get token: ${response.statusText}`);
      }

      const { token } = await response.json();

      const ws = new WebSocket(`${ASSEMBLYAI_WS_URL}?sample_rate=${SAMPLE_RATE}&token=${token}`);

      ws.onopen = () => {
        setIsConnecting(false);
        startRecordingLoop();
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.message_type === 'SessionBegins') {
        } else if (data.message_type === 'PartialTranscript') {
          const newText = data.text || '';
          setCurrentPartialTranscript(newText);
          // Pass only the latest partial text to the parent
          onTranscriptionUpdate?.(newText, false);
        } else if (data.message_type === 'FinalTranscript') {
          const newText = data.text || '';
          // Append to finalized transcript
          setFinalizedTranscript(prev => prev ? `${prev} ${newText}`.trim() : newText);
          // Clear the current partial transcript
          setCurrentPartialTranscript('');
          // Pass the final text chunk to the parent
          onTranscriptionUpdate?.(newText, true);
        }
      };

      ws.onerror = (error) => {
        console.error('[DEBUG] WebSocket error:', error);
        setError('WebSocket connection error');
        stopRealtimeTranscription();
      };

      ws.onclose = (event) => {
        stopRealtimeTranscription();
      };

      websocketRef.current = ws;
    } catch (error) {
      console.error('[DEBUG] Error starting transcription:', error);
      setError(error instanceof Error ? error.message : 'Failed to start transcription');
      stopRealtimeTranscription();
    }
  };

  const stopRealtimeTranscription = () => {
    const ws = websocketRef.current;
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      websocketRef.current = null;
    }
    stopRecordingLoop();
    setIsListening(false);
    setIsRecording(false);
    setIsConnecting(false);
  };

  const runRecordingCycle = async () => {
    if (!isListeningRef.current || !websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const recording = new Audio.Recording();

      // Explicitly configure recording for WAV format required by AssemblyAI
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

      await recording.startAsync();

      await new Promise(resolve => setTimeout(resolve, RECORDING_INTERVAL_MS));

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );

      if (status.isLoaded) {
        const audioData = await sound.getStatusAsync();
        
        if (audioData.isLoaded) {
          const response = await fetch(uri);
          const audioBlob = await response.blob();
          
          const base64Audio = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64
          });

          if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            websocketRef.current.send(JSON.stringify({ audio_data: base64Audio }));
          }
        }
      }

      await sound.unloadAsync();

      // Cleanup the recording file
      try {
        await FileSystem.deleteAsync(uri);
      } catch (deleteError) {
        console.error('[DEBUG] Error deleting recording file:', deleteError);
      }

      if (isListeningRef.current) {
        recordingTimeoutRef.current = setTimeout(runRecordingCycle, RECORDING_INTERVAL_MS);
      }
    } catch (error) {
      console.error('[DEBUG] Error in recording cycle:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
      stopRealtimeTranscription();
    }
  };

  const startRecordingLoop = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
    recordingTimeoutRef.current = setTimeout(runRecordingCycle, 100);
  };

  const stopRecordingLoop = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  };

  // --- UI Rendering ---
  function getStatusText() {
    if (error) return `Error: ${error}`;
    if (isConnecting) return 'Connecting...';
    if (isListening) return 'Listening...';
    if (isRecording) return 'Starting...';
    return 'Ready to record';
  }

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{getStatusText()}</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {(finalizedTranscript || currentPartialTranscript) ? (
        <ScrollView style={styles.transcriptScrollView}>
          <Text style={styles.transcriptionText}>
            {finalizedTranscript}
            {finalizedTranscript && currentPartialTranscript ? ' ' : ''}
            <Text style={styles.partialText}>{currentPartialTranscript}</Text>
          </Text>
        </ScrollView>
      ) : null}

      <TouchableOpacity
        style={[styles.button, isRecording && styles.recordingButton]}
        onPress={isRecording ? stopRealtimeTranscription : startRealtimeTranscription}
        disabled={isConnecting}
      >
        <Text style={styles.buttonText}>
          {isConnecting ? 'Connecting...' : (isRecording ? 'Stop Recording' : 'Start Real-time')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  status: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    marginTop: 10,
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
  transcriptScrollView: {
    marginTop: 15,
    maxHeight: 150,
    width: '100%',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F8F8F8',
  },
  transcriptionText: {
    fontSize: 15,
    color: '#333',
  },
  partialText: {
    color: '#888',
    fontStyle: 'italic',
  },
}); 