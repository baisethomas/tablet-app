import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { AudioRecorder } from '../components/AudioRecorder';
import * as FileSystem from 'expo-file-system';

// Assume these functions exist and are imported from your service file
import {
  uploadAudioFile,
  submitBatchJob,
  pollBatchJobStatus
} from '../services/assemblyai';

// Define UI states
type UiState = 'Idle' | 'Recording' | 'Uploading' | 'Processing' | 'Complete' | 'Error';

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
  const pollJobLoop = (currentJobId: string) => {
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
          
          setFinalTranscript(result.text || '');
          setUiState('Complete');
          setJobId(null);
          await cleanupFullAudioFile(null); // Use URI from state
        } else if (result.status === 'error') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          setErrorMessage(result.error || 'Transcription job failed.');
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
        setErrorMessage(error.message || "Failed to check transcription status.");
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

      // Step 3: Start Polling
      pollJobLoop(submittedJobId);

    } catch (error: any) {
      console.error("Batch Processing Error:", error);
      setErrorMessage(error.message || "Failed to start transcription process.");
      setUiState('Error');
      // Clean up the file immediately if the process fails early
      await cleanupFullAudioFile(audioUri); 
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
            <Text style={[styles.infoText, { color: colors.text.secondary, marginTop: 15 }]}>
              Uploading audio file...
            </Text>
          </View>
        );
      case 'Processing':
        return (
          <View style={styles.centeredInfo}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text.secondary, marginTop: 15 }]}>
              Processing transcription (this may take a moment)...
            </Text>
            {jobId && <Text style={[styles.infoTextSmall, { color: colors.text.tertiary }]}>Job ID: {jobId}</Text>}
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
          <View style={styles.centeredInfo}>
            <Text style={[styles.errorTitle, { color: colors.ui.error }]}>Error</Text>
            <Text style={[styles.errorText, { color: colors.text.secondary }]}>
              {errorMessage || 'An unknown error occurred.'}
            </Text>
          </View>
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
  // Error display styles
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
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