import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useCallback, useRef } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { SavedSermon } from '../types/sermon';
import { 
    addSermon, 
    updateSermon, 
    getSermonById
} from '../services/sermon-storage'; 
import { 
    uploadAudioFile, 
    submitBatchJob, 
    pollBatchJobStatus, 
    TranscriptionResponse
} from '../services/assemblyai';
import { generateSermonSummary } from '../services/openai';

// --- State Definition ---
interface RecordingState {
  isRecording: boolean;
  isPaused: boolean; // Note: expo-av recording might not truly pause/resume easily
  recordingInstance: Audio.Recording | null;
  recordingUri: string | null; // URI after stopping
  recordingDurationMillis: number;
  activeSermonId: string | null; // ID of the sermon being recorded
  isProcessing: boolean; // Added state for background processing
  error: string | null;
}

// --- SavedSermon type might need updating ---
// Ensure SavedSermon includes optional fields for summary and notes if not already present
// Example update (adjust based on your actual SavedSermon type):
/*
export interface SavedSermon {
  id: string;
  date: string;
  title?: string;
  transcript: string;
  audioUrl?: string;
  notes?: string;
  summary?: StructuredSummary; // Add summary field
}
*/

const initialState: RecordingState = {
  isRecording: false,
  isPaused: false,
  recordingInstance: null,
  recordingUri: null,
  recordingDurationMillis: 0,
  activeSermonId: null,
  isProcessing: false,
  error: null,
};

// --- Action Definitions ---
type Action =
  | { type: 'START_RECORDING'; payload: { recording: Audio.Recording; sermonId: string } }
  | { type: 'PAUSE_RECORDING' } // May just update state, not Audio.Recording
  | { type: 'RESUME_RECORDING' } // May just update state
  | { type: 'STOP_RECORDING'; payload: { uri: string } }
  | { type: 'START_PROCESSING' }
  | { type: 'FINISH_PROCESSING'; payload?: { error?: string } }
  | { type: 'UPDATE_DURATION'; payload: number }
  | { type: 'RECORDING_ERROR'; payload: string }
  | { type: 'RESET' };

// --- Reducer ---
function recordingReducer(state: RecordingState, action: Action): RecordingState {
  switch (action.type) {
    case 'START_RECORDING':
      return {
        ...initialState, // Reset most state on new recording
        isRecording: true,
        isPaused: false,
        recordingInstance: action.payload.recording,
        activeSermonId: action.payload.sermonId,
      };
    case 'PAUSE_RECORDING':
      return { ...state, isPaused: true };
    case 'RESUME_RECORDING':
      return { ...state, isPaused: false };
    case 'STOP_RECORDING':
      return {
        ...state,
        isRecording: false,
        isPaused: false,
        recordingInstance: null,
        recordingUri: action.payload.uri,
      };
    case 'START_PROCESSING':
      return { ...state, isProcessing: true, error: null };
    case 'FINISH_PROCESSING':
      return { 
        ...state, 
        isProcessing: false, 
        error: action.payload?.error || null,
        activeSermonId: null,
        recordingUri: null,
      };
    case 'UPDATE_DURATION':
      return { ...state, recordingDurationMillis: action.payload };
    case 'RECORDING_ERROR':
      return {
        ...state,
        isRecording: false,
        isPaused: false,
        isProcessing: false,
        error: action.payload,
        recordingInstance: null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// --- Context Definition ---
interface RecordingContextType extends RecordingState {
  dispatch: Dispatch<Action>;
  startRecording: () => Promise<string | null>; // Returns new sermonId or null
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  stopRecordingAndProcess: () => Promise<void>;
}

const RecordingContext = createContext<RecordingContextType | undefined>(undefined);

// --- Provider Component ---
interface RecordingProviderProps {
  children: ReactNode;
}

export function RecordingProvider({ children }: RecordingProviderProps) {
  const [state, dispatch] = useReducer(recordingReducer, initialState);
  const recordingRef = useRef<Audio.Recording | null>(null);

  // --- Recording Status Update Handler ---
  const onRecordingStatusUpdate = useCallback((status: any) => { 
    // Only proceed if status looks like a valid recording status object
    if (status && typeof status.isRecording === 'boolean' && typeof status.durationMillis === 'number') {
      if (status.isRecording) {
        dispatch({ type: 'UPDATE_DURATION', payload: status.durationMillis });
      }
      
      // Check if recording stopped unexpectedly while we thought it was active
      // Use optional chaining for isDoneRecording as it might not always be present
      if (status.isDoneRecording === true && state.isRecording) {
          const errorMsg = "Recording stopped unexpectedly.";
          console.error("Recording Status Error:", errorMsg, status);
          dispatch({ type: 'RECORDING_ERROR', payload: errorMsg });
          recordingRef.current?.stopAndUnloadAsync().catch(e => console.error("Cleanup error:", e));
          recordingRef.current = null;
      }
      
      // Check if recording capability is lost
      if (status.canRecord === false) {
          const errorMsg = "Recording cannot continue (permissions issue or resource conflict?)";
          console.error("Recording Status Error:", errorMsg, status);
          dispatch({ type: 'RECORDING_ERROR', payload: errorMsg });
          recordingRef.current?.stopAndUnloadAsync().catch(e => console.error("Cleanup error:", e));
          recordingRef.current = null;
      }
    } else {
      // Log if the status object is not what we expect
      console.warn("Received unexpected/invalid recording status object:", status);
    }
  }, [state.isRecording]); 

  // --- Async Action Functions ---
  const startRecording = useCallback(async (): Promise<string | null> => {
    console.log('[RecordingContext] Attempting to start recording...');
    dispatch({ type: 'RESET' }); // Clear previous state/errors
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Microphone permission is required to record audio.');
      }
      console.log('[RecordingContext] Permission granted.');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        // ... other audio mode settings ...
      });
      console.log('[RecordingContext] Audio mode set.');

      const newRecording = new Audio.Recording();
      // Pass the callback, accepting the type mismatch for now
      newRecording.setOnRecordingStatusUpdate(onRecordingStatusUpdate as any);
      await newRecording.prepareToRecordAsync({
          android: {
              extension: '.m4a',
              outputFormat: Audio.AndroidOutputFormat.MPEG_4,
              audioEncoder: Audio.AndroidAudioEncoder.AAC,
              sampleRate: 44100,
              numberOfChannels: 1,
              bitRate: 128000,
          },
          ios: {
              extension: '.m4a',
              outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
              audioQuality: Audio.IOSAudioQuality.HIGH,
              sampleRate: 44100,
              numberOfChannels: 1,
              bitRate: 128000,
              linearPCMBitDepth: 16,
              linearPCMIsBigEndian: false,
              linearPCMIsFloat: false,
          },
          web: {
             mimeType: 'audio/webm',
             bitsPerSecond: 128000,
          }
      });
      
      // Create placeholder sermon object
      const sermonId = `rec_${Date.now()}`;
      const sermonDate = new Date().toISOString();
      const placeholderSermon: SavedSermon = {
        id: sermonId,
        date: sermonDate,
        title: `Recording - ${new Date(sermonDate).toLocaleTimeString()}`,
        transcript: '', 
        processingStatus: 'processing', // Start in processing state
      };

      // Use the storage service to add the sermon
      await addSermon(placeholderSermon);
      console.log(`[RecordingContext] Placeholder sermon added via service: ${sermonId}`);

      await newRecording.startAsync();
      console.log('[RecordingContext] Recording started.');
      recordingRef.current = newRecording; // Store instance in ref
      dispatch({ type: 'START_RECORDING', payload: { recording: newRecording, sermonId } });
      return sermonId;

    } catch (err: any) {
      console.error('[RecordingContext] Failed to start recording:', err);
      dispatch({ type: 'RECORDING_ERROR', payload: err.message || 'Failed to start recording.' });
      // Clean up instance if it exists
      await recordingRef.current?.stopAndUnloadAsync().catch(e => console.error("Cleanup error:", e));
      recordingRef.current = null;
      return null;
    }
  }, [onRecordingStatusUpdate]);

  // Pause/Resume might be tricky/platform-dependent with expo-av recording,
  // keeping simple state updates for now. // NOW IMPLEMENTING ACTUAL PAUSE/RESUME
  const pauseRecording = useCallback(async () => {
    if (!state.isRecording || state.isPaused || !recordingRef.current) return;
    console.log('[RecordingContext] Attempting to pause recording...');
    try {
      await recordingRef.current.pauseAsync();
      console.log('[RecordingContext] Recording paused successfully.');
      dispatch({ type: 'PAUSE_RECORDING' });
    } catch (error: any) {
      console.error('[RecordingContext] Failed to pause recording:', error);
      // Optionally dispatch an error action or update state.error
      dispatch({ type: 'RECORDING_ERROR', payload: `Failed to pause: ${error.message || 'Unknown error'}` });
    }
  }, [state.isRecording, state.isPaused]);

  const resumeRecording = useCallback(async () => {
    if (!state.isRecording || !state.isPaused || !recordingRef.current) return;
    console.log('[RecordingContext] Attempting to resume recording...');
    try {
      await recordingRef.current.startAsync(); // startAsync is used for resuming
      console.log('[RecordingContext] Recording resumed successfully.');
      dispatch({ type: 'RESUME_RECORDING' });
    } catch (error: any) {
      console.error('[RecordingContext] Failed to resume recording:', error);
      // Optionally dispatch an error action or update state.error
      dispatch({ type: 'RECORDING_ERROR', payload: `Failed to resume: ${error.message || 'Unknown error'}` });
    }
  }, [state.isRecording, state.isPaused]);

  const stopRecordingAndProcess = useCallback(async () => {
    if (!state.isRecording || !recordingRef.current) return;
    console.log('[RecordingContext] Stopping recording...');
    const recordingInstanceToStop = recordingRef.current; 
    const sermonIdToProcess = state.activeSermonId;
    const finalDurationMillis = state.recordingDurationMillis; // Capture duration before state changes
    recordingRef.current = null; 
    
    let audioUri: string | null = null;
    try {
      // Stop and get URI
      await recordingInstanceToStop.stopAndUnloadAsync();
      audioUri = recordingInstanceToStop.getURI();
      console.log(`[RecordingContext] Recording stopped. URI: ${audioUri}, Duration: ${finalDurationMillis}ms`); // Log duration
      if (!audioUri) {
        throw new Error('Failed to get recording URI after stopping.');
      }
      if (!sermonIdToProcess) {
        throw new Error('Cannot process recording without an active sermon ID.');
      }
      
      // Dispatch STOP_RECORDING first
      dispatch({ type: 'STOP_RECORDING', payload: { uri: audioUri } }); 
      
      // ---- Update Status and Start Background Processing ----
      try {
        console.log(`[RecordingContext] Updating sermon ${sermonIdToProcess} status to 'processing'...`);
        // Log the duration value just before saving
        console.log(`[RecordingContext] Saving durationMillis: ${finalDurationMillis}`); 
        await updateSermon(sermonIdToProcess, { 
            processingStatus: 'processing', 
            audioUrl: audioUri, // Save local URI
            durationMillis: finalDurationMillis // Save captured duration
        });

        // Dispatch START_PROCESSING for UI update
        dispatch({ type: 'START_PROCESSING' });
        
        // Call the background processing function (defined below) - DO NOT AWAIT
        console.log(`[RecordingContext] Starting background processing function for sermon: ${sermonIdToProcess}`);
        processRecordingInBackground(audioUri, sermonIdToProcess, dispatch);
        
      } catch (updateError: any) {
        // Handle errors during the initial status update
        console.error(`[RecordingContext] Failed to update status to 'processing' for sermon ${sermonIdToProcess}:`, updateError);
        dispatch({ type: 'FINISH_PROCESSING', payload: { error: `Failed to start processing: ${updateError.message}` } }); 
      }
      // ---- End Background Processing Start ----

    } catch (stopError: any) {
      // Handle errors during stopAndUnloadAsync or getURI
      console.error('[RecordingContext] Failed to stop recording or get URI:', stopError);
      dispatch({ type: 'RECORDING_ERROR', payload: stopError.message || 'Failed to stop recording.' });
      // Attempt to update status to error if we have an ID
      if (sermonIdToProcess) {
         updateSermon(sermonIdToProcess, { 
            processingStatus: 'error', 
            processingError: `Failed during recording stop: ${stopError.message}`,
            durationMillis: finalDurationMillis // Still save duration even on stop error?
         }).catch(e => console.error("CRITICAL: Failed to update sermon status to error after stop failure:", e));
      }
      dispatch({ type: 'FINISH_PROCESSING', payload: { error: stopError.message || 'Failed to stop recording.' } }); 
    }
  }, [state.isRecording, state.activeSermonId, state.recordingDurationMillis]); // Add duration to dependency array

  const value = {
    ...state,
    dispatch,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecordingAndProcess,
  };

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  );
}

// --- Background Processing Function ---
async function processRecordingInBackground(
  audioUri: string, 
  sermonId: string,
  dispatch: Dispatch<Action> 
) {
  console.log(`[processRecordingInBackground] Starting for sermon: ${sermonId}`);
  let finalStatus: SavedSermon['processingStatus'] = 'error';
  let finalError: string | undefined = 'Unknown processing error occurred.';
  let summaryResult: SavedSermon['summary'] = undefined;
  let transcriptResult: string = '';
  let sermonTitle = `Recording ${sermonId.substring(sermonId.length - 5)}`;
  let transcriptResponse: TranscriptionResponse | null = null; // Store full response

  // Try to get actual sermon title for better notifications
  try {
      const sermon = await getSermonById(sermonId);
      if (sermon?.title) {
          sermonTitle = sermon.title;
      }
  } catch (e) {
      console.warn(`[processRecordingInBackground] Could not fetch sermon title for notification: ${e}`);
  }

  // Schedule initial processing notification
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Processing Sermon",
        body: `Processing "${sermonTitle}"...`,
      },
      trigger: null, // Send immediately
    });
  } catch (e) {
      console.warn(`[processRecordingInBackground] Failed to schedule initial notification: ${e}`);
  }

  try {
    // 1. Upload Audio
    console.log(`[processRecordingInBackground] Uploading audio...`);
    const uploadUrl = await uploadAudioFile(audioUri);
    if (!uploadUrl) throw new Error("Audio upload failed, no URL returned.");
    console.log(`[processRecordingInBackground] Upload successful: ${uploadUrl}`);

    // 2. Submit Transcription Job
    console.log(`[processRecordingInBackground] Submitting transcription job...`);
    const jobId = await submitBatchJob(uploadUrl);
    if (!jobId) throw new Error("Transcription job submission failed, no ID returned.");
    console.log(`[processRecordingInBackground] Job submitted: ${jobId}`);

    // 3. Poll for Transcription Result
    console.log(`[processRecordingInBackground] Polling for transcription results...`);
    transcriptResponse = await pollBatchJobStatus(jobId); // Get full response
    if (transcriptResponse.status !== 'completed' || !transcriptResponse.text) {
      throw new Error(transcriptResponse.error || 'Transcription polling failed or returned no text.');
    }
    transcriptResult = transcriptResponse.text; // Keep plain text for summary
    console.log(`[processRecordingInBackground] Transcription complete. Received paragraphs: ${!!transcriptResponse.paragraphs}, words: ${!!transcriptResponse.words}`);

    // 4. Generate Summary (using plain text)
    try {
        console.log(`[processRecordingInBackground] Generating summary...`);
        summaryResult = await generateSermonSummary(transcriptResult);
        console.log(`[processRecordingInBackground] Summary generated.`);
    } catch (summaryError: any) {
        console.warn(`[processRecordingInBackground] Failed to generate summary:`, summaryError.message);
    }

    // Success
    finalStatus = 'completed';
    finalError = undefined;
    console.log(`[processRecordingInBackground] Processing successful for sermon ${sermonId}.`);

  } catch (err: any) {
    console.error(`[processRecordingInBackground] Error during processing sermon ${sermonId}:`, err);
    finalError = err.message || 'An unknown error occurred during background processing.';
    finalStatus = 'error';

  } finally {
    // 5. Update Sermon Record in AsyncStorage
    try {
      console.log(`[processRecordingInBackground] Updating final sermon record for ${sermonId} with status: ${finalStatus}`);
      await updateSermon(sermonId, {
        processingStatus: finalStatus,
        transcript: finalStatus === 'completed' ? transcriptResult : '', 
        // Ensure assignment matches type: TranscriptionResponse | undefined
        transcriptData: finalStatus === 'completed' && transcriptResponse ? transcriptResponse : undefined, 
        summary: finalStatus === 'completed' ? summaryResult : undefined,
        processingError: finalError,
        audioUrl: audioUri, 
      });
      console.log(`[processRecordingInBackground] Final update successful for ${sermonId}.`);
    } catch (updateErr: any) {
      console.error(`[processRecordingInBackground] CRITICAL: Failed to update final sermon status for ${sermonId}:`, updateErr);
      finalError = finalError ? `${finalError}. Additionally, failed to save final status.` : `Failed to save final status.`;
    }
    
    // Schedule final notification based on status
    try {
      let notificationTitle = "Sermon Ready";
      let notificationBody = `"${sermonTitle}" has been processed successfully.`;
      if (finalStatus === 'error') {
          notificationTitle = "Processing Error";
          notificationBody = `Failed to process "${sermonTitle}": ${finalError || 'Unknown error'}`;
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notificationTitle,
          body: notificationBody,
          // Optional: Add sound, data for tap action, etc.
          // data: { sermonId: sermonId } 
        },
        trigger: null, // Send immediately
      });
    } catch (e) {
      console.warn(`[processRecordingInBackground] Failed to schedule final notification: ${e}`);
    }
    
    // 7. Dispatch FINISH_PROCESSING to update context state
    let dispatchPayload: { error?: string } | undefined = undefined;
    if (finalError) {
      dispatchPayload = { error: finalError }; 
    }
    dispatch({ type: 'FINISH_PROCESSING', payload: dispatchPayload });
    console.log(`[processRecordingInBackground] Task finished for sermon ${sermonId}. Status: ${finalStatus}`);
  }
}

// --- Hook ---
export function useRecording() {
  const context = useContext(RecordingContext);
  if (context === undefined) {
    throw new Error('useRecording must be used within a RecordingProvider');
  }
  return context;
} 