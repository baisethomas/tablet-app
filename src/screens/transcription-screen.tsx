import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { AudioRecorder } from '../components/AudioRecorder';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';

// Assume these functions exist and are imported from your service file
import {
  uploadAudioFile,
  submitBatchJob,
  pollBatchJobStatus
} from '../services/assemblyai';

// Define UI states
type UiState = 'Idle' | 'Recording' | 'Uploading' | 'Processing' | 'Complete' | 'Error';

// Define the structure for saved data
interface SavedSermon {
  id: string; 
  date: string; 
  title?: string; 
  transcript: string; 
  audioUrl?: string;
}

// Helper function to format error messages
function formatApiError(error: any, defaultMessage: string): string {
  // Basic check for Axios-like error structure (common with fetch wrappers)
  if (error?.response?.data?.error) {
    return `API Error: ${error.response.data.error}`;
  }
  // Check for AssemblyAI specific error in job status
  if (error?.status === 'error' && error?.error) {
      return `Transcription Error: ${error.error}`;
  }
  // Standard Error object message
  if (error?.message) {
    return error.message;
  }
  // Fallback
  return defaultMessage;
}

export function TranscriptionScreen() {
  const { colors } = useTheme();
  
  // State Management for Batch Process
  const [uiState, setUiState] = useState<UiState>('Idle');
  const [fullAudioUri, setFullAudioUri] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [finalTranscript, setFinalTranscript] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add useEffect to monitor state change
  useEffect(() => {
    // Log only when the transcript state is actually set (not null initially)
    if (finalTranscript !== null) {
      console.log("State Check: finalTranscript updated in state:", finalTranscript);
    }
  }, [finalTranscript]);

  // Ref to manage polling interval
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Cleanup polling on unmount ---
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // --- Core Logic Functions ---

  // Cleanup temporary audio file
  const cleanupFullAudioFile = async (audioUri: string | null) => {
    const uriToClean = audioUri || fullAudioUri;
    if (uriToClean) {
      try {
        await FileSystem.deleteAsync(uriToClean);
        console.log("Deleted temporary audio file:", uriToClean);
        if (!audioUri) { // Clear state only if using state URI
          setFullAudioUri(null);
        }
      } catch (deleteError) {
        console.error("Error deleting audio file:", deleteError);
      }
    }
  };

  // Polling loop for checking job status
  // Accepts audioUriForSaving to avoid stale state in callback
  const pollJobLoop = (currentJobId: string, audioUriForSaving: string) => {
    // Clear any existing interval
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        console.log(`Polling job status for: ${currentJobId}`);
        const result = await pollBatchJobStatus(currentJobId); // From service
        
        if (result.status === 'completed') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          
          // Log the entire result object upon completion
          console.log("Job Complete! Result object:", JSON.stringify(result, null, 2)); 
          
          const completedTranscript = result.text || '';
          setFinalTranscript(completedTranscript);
          setUiState('Complete');
          setJobId(null);
          
          // Save the completed transcript right after completion
          // Pass the audio URI explicitly
          await saveTranscriptToStorage(completedTranscript, audioUriForSaving);

          // Delete temp file AFTER saving is done (or attempted)
          // We no longer delete here because we want to keep it for playback
          // await cleanupFullAudioFile(null); 

        } else if (result.status === 'error') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          // Use the helper to format the error from the result object
          setErrorMessage(formatApiError(result, 'Transcription job failed.'));
          setUiState('Error');
          setJobId(null);
          await cleanupFullAudioFile(null);
        } else {
          // Still processing ('queued' or 'processing') - continue polling
          console.log('Job Status:', result.status);
        }
      } catch (error: any) {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        console.error("Polling Error:", error);
        // Use the helper to format the error from the catch block
        setErrorMessage(formatApiError(error, "Failed to check transcription status."));
        setUiState('Error');
        setJobId(null);
        await cleanupFullAudioFile(null);
      }
    }, 5000); // Poll every 5 seconds (adjust as needed)
  };

  // Orchestrates the batch process after recording stops
  const startBatchTranscription = async (audioUri: string) => {
    try {
      // Step 1: Upload
      console.log("Uploading audio file...");
      const uploadUrl = await uploadAudioFile(audioUri); // From service
      if (!uploadUrl) throw new Error("Upload failed, no URL returned.");
      console.log("Upload successful. URL:", uploadUrl);
      setUiState('Processing'); // Move to processing after successful upload

      // Step 2: Submit Job
      console.log("Submitting transcription job...");
      const submittedJobId = await submitBatchJob(uploadUrl); // From service
      if (!submittedJobId) throw new Error("Job submission failed, no ID returned.");
      console.log("Job submitted successfully. ID:", submittedJobId);
      setJobId(submittedJobId);

      // Step 3: Start Polling, passing the audioUri needed for saving
      pollJobLoop(submittedJobId, audioUri);

    } catch (error: any) {
      console.error("Batch Processing Error:", error);
      // Use the helper to format the error from the catch block
      setErrorMessage(formatApiError(error, "Failed to start transcription process."));
      setUiState('Error');
      // Clean up the file immediately if the process fails early
      await cleanupFullAudioFile(audioUri); 
    }
  };

  // Function to save the transcript using AsyncStorage
  // Now accepts audioUrlToSave as a parameter
  const saveTranscriptToStorage = async (transcriptToSave: string, audioUrlToSave: string) => {
    if (!transcriptToSave) return; // Don't save empty transcripts
    // Use the passed-in audioUrlToSave directly
    if (!audioUrlToSave) {
      console.error("Cannot save sermon, audio URL was not provided to save function.");
      Alert.alert("Error", "Could not find the audio file to save.");
      return;
    }

    try {
      const sermonId = Date.now().toString();
      const sermonDate = new Date().toISOString();
      const newSermon: SavedSermon = {
        id: sermonId,
        date: sermonDate,
        transcript: transcriptToSave,
        title: `Sermon - ${new Date(sermonDate).toLocaleDateString()}`, // Example title
        audioUrl: audioUrlToSave, // Use the passed-in audio URI
      };

      const existingData = await AsyncStorage.getItem('savedSermons');
      let sermonsArray: SavedSermon[] = [];
      if (existingData !== null) {
        try {
          sermonsArray = JSON.parse(existingData);
          if (!Array.isArray(sermonsArray)) {
              console.warn('Saved sermons data is not an array, resetting.');
              sermonsArray = [];
          }
        } catch (parseError) {
          console.error('Error parsing saved sermons:', parseError);
          sermonsArray = []; // Reset on parse error
        }
      }
      
      sermonsArray.unshift(newSermon); // Add new sermon to the beginning

      await AsyncStorage.setItem('savedSermons', JSON.stringify(sermonsArray));
      console.log('Sermon saved successfully to AsyncStorage!');
      Alert.alert('Success', 'Transcription saved successfully.');
      
      // !! Important: Do NOT delete the audio file here anymore !!
      // await cleanupFullAudioFile(null); // REMOVED

    } catch (error) {
      console.error('Failed to save transcription to AsyncStorage:', error);
      Alert.alert('Error', 'Failed to save transcription locally.');
    }
  };

  // Callback from AudioRecorder when recording stops
  const handleRecordingStop = (audioUri: string) => {
    console.log("Recording stopped, received audio URI:", audioUri);
    setFullAudioUri(audioUri); // Store URI
    setUiState('Uploading'); // Start the batch process
    setErrorMessage(null);
    setFinalTranscript(null);
    setJobId(null);
    startBatchTranscription(audioUri);
  };

  // Function to reset the screen to initial state
  const handleReset = () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      // Ensure cleanup if reset happens during upload/processing
      if(fullAudioUri && (uiState === 'Uploading' || uiState === 'Processing' || uiState === 'Error')) {
        cleanupFullAudioFile(fullAudioUri);
      }
      setUiState('Idle');
      setFullAudioUri(null);
      setJobId(null);
      setFinalTranscript(null);
      setErrorMessage(null);
  }

  // --- Conditional UI Rendering --- 
  const renderContent = () => {
    switch (uiState) {
      case 'Idle':
        return (
          <View style={styles.centeredInfo}>
            <Text style={[styles.infoText, { color: colors.text.secondary }]}>
              Press Start Recording below.
            </Text>
          </View>
        );
      case 'Recording': // Note: AudioRecorder shows its own internal recording state
         return (
          <View style={styles.centeredInfo}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text.secondary, marginTop: 15 }]}>
              Recording in progress...
            </Text>
          </View>
        );
      case 'Uploading':
        return (
          <View style={styles.centeredInfo}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text.primary, fontWeight: 'bold' }]}>
              Uploading Audio...
            </Text>
            <Text style={[styles.infoTextSmall, { color: colors.text.secondary }]}>
              Please wait while the recording is securely uploaded.
            </Text>
          </View>
        );
      case 'Processing':
        return (
          <View style={styles.centeredInfo}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text.primary, fontWeight: 'bold' }]}>
              Transcribing Audio...
            </Text>
            <Text style={[styles.infoTextSmall, { color: colors.text.secondary }]}>
              This may take a few moments depending on the length of the recording.
            </Text>
          </View>
        );
      case 'Complete':
        return (
          <View style={styles.resultsContainer}>
             <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Completed Transcript</Text>
             <ScrollView style={styles.transcriptArea} persistentScrollbar={true}>
              <Text style={[
                styles.transcriptionText, 
                { 
                  color: 'black', // Use black for contrast (or colors.text.secondary if defined)
                  // backgroundColor: 'yellow', // REMOVE Temporary background
                }
              ]}>
                {finalTranscript || 'No transcript generated.'}
              </Text>
            </ScrollView>
          </View>
        );
      case 'Error':
        return (
          <ErrorDisplay 
            message={errorMessage || 'An unknown error occurred.'}
            onRetry={handleReset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Record & Transcribe Sermon
        </Text>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>

      <View style={styles.footer}>
        {/* Show recorder only when Idle */}
        {uiState === 'Idle' && (
          <AudioRecorder onRecordingStop={handleRecordingStop} />
        )}
        {/* Show Reset button when processing finished or errored */}
        {(uiState === 'Complete' || uiState === 'Error') && (
           <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
             <Text style={styles.resetButtonText}>Record New</Text>
           </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', 
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  // Centered container for status messages
  centeredInfo: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  infoText: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: 10,
  },
  infoTextSmall: {
      fontSize: 12,
      textAlign: 'center',
      marginTop: 5,
  },
  // Container for results display
  resultsContainer: {
      flex: 1,
      flexDirection: 'column', // Ensure vertical layout
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  transcriptArea: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0', 
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F8F8F8',
  },
  transcriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    minHeight: 80, // Adjust height as needed
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
      backgroundColor: '#6c757d', // Example secondary/reset color
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 8,
      minWidth: 200,
      alignItems: 'center',
  },
  resetButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
  },
}); 