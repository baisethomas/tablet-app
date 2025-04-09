import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useCallback, useRef } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedSermon } from '../types/sermon';
import { uploadAudioFile, submitBatchJob, pollBatchJobStatus } from '../services/assemblyai';
import { generateSermonSummary, StructuredSummary } from '../services/openai';
import { 
    addSermon, 
    updateSermon, 
    getSermonById // Import relevant storage functions
} from '../services/sermon-storage'; 

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
  // Ref to hold the recording instance, prevents needing it in useCallback deps
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
  // keeping simple state updates for now.
  const pauseRecording = useCallback(async () => {
    if (!state.isRecording || state.isPaused || !recordingRef.current) return;
    console.log('[RecordingContext] Pausing recording (state only)...');
    // Consider if `recordingRef.current.pauseAsync()` is reliable
    dispatch({ type: 'PAUSE_RECORDING' });
  }, [state.isRecording, state.isPaused]);

  const resumeRecording = useCallback(async () => {
    if (!state.isRecording || !state.isPaused || !recordingRef.current) return;
    console.log('[RecordingContext] Resuming recording (state only)...');
    // Consider if `recordingRef.current.startAsync()` resumes
    dispatch({ type: 'RESUME_RECORDING' });
  }, [state.isRecording, state.isPaused]);

  const stopRecordingAndProcess = useCallback(async () => {
    if (!state.isRecording || !recordingRef.current) return;
    console.log('[RecordingContext] Stopping recording...');
    const recordingInstanceToStop = recordingRef.current; // Capture instance
    const sermonIdToProcess = state.activeSermonId;
    recordingRef.current = null; // Clear ref immediately
    
    try {
      await recordingInstanceToStop.stopAndUnloadAsync();
      const uri = recordingInstanceToStop.getURI();
      console.log(`[RecordingContext] Recording stopped. URI: ${uri}`);
      if (!uri) {
        throw new Error('Failed to get recording URI after stopping.');
      }
      if (!sermonIdToProcess) {
        throw new Error('Cannot process recording without an active sermon ID.');
      }
      
      // Dispatch immediately to update UI state (stop showing duration etc.)
      dispatch({ type: 'STOP_RECORDING', payload: { uri } }); 
      dispatch({ type: 'START_PROCESSING' });

      // --- Start Background Processing (Do NOT await these here) ---
      console.log(`[RecordingContext] Starting background processing for sermon: ${sermonIdToProcess}`);
      processRecordingInBackground(uri, sermonIdToProcess, dispatch);

    } catch (err: any) {
      console.error('[RecordingContext] Failed to stop recording:', err);
      dispatch({ type: 'RECORDING_ERROR', payload: err.message || 'Failed to stop recording.' });
      dispatch({ type: 'FINISH_PROCESSING', payload: { error: err.message } }); // Indicate processing failed
    }
  }, [state.isRecording, state.activeSermonId]);

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
  let finalError: string | null = null;
  try {
    // Mark as processing using the service
    console.log(`[BackgroundProcess] Marking sermon ${sermonId} as processing...`);
    await updateSermon(sermonId, { processingStatus: 'processing' }); // ID first

    // 1. Upload
    console.log(`[BackgroundProcess] Uploading: ${audioUri}`);
    const uploadUrl = await uploadAudioFile(audioUri);
    if (!uploadUrl) throw new Error("Upload failed, no URL.");
    console.log(`[BackgroundProcess] Uploaded. URL: ${uploadUrl}`);

    // 2. Submit Transcription Job
    console.log(`[BackgroundProcess] Submitting job...`);
    const jobId = await submitBatchJob(uploadUrl);
    if (!jobId) throw new Error("Job submission failed, no ID.");
    console.log(`[BackgroundProcess] Job Submitted. ID: ${jobId}`);

    // 3. Poll for Transcription Result
    console.log(`[BackgroundProcess] Polling job status...`);
    const transcriptResult = await pollBatchJobStatus(jobId); // Assumes this polls until done/error
    if (transcriptResult.status !== 'completed' || !transcriptResult.text) {
      throw new Error(transcriptResult.error || 'Transcription failed or produced no text.');
    }
    const transcript = transcriptResult.text;
    console.log(`[BackgroundProcess] Transcription complete.`);

    // 4. Generate Summary
    console.log(`[BackgroundProcess] Generating summary...`);
    const summary = await generateSermonSummary(transcript);
    console.log(`[BackgroundProcess] Summary generated.`);

    // 5. Update Sermon using the service
    console.log(`[BackgroundProcess] Updating sermon record: ${sermonId} with results...`);
    await updateSermon(
      sermonId, // ID first
      {
        transcript: transcript,
        audioUrl: audioUri, 
        summary: summary || undefined,
        processingStatus: 'completed',
        processingError: undefined, 
      }
    ); 
    console.log(`[BackgroundProcess] Sermon record updated successfully via service.`);

  } catch (error: any) {
    console.error('[BackgroundProcess] Error:', error);
    finalError = error.message || 'Background processing failed.';
    // Update storage with error status using the service
    try {
      await updateSermon(
        sermonId, // ID first
        { 
          processingStatus: 'error', 
          processingError: finalError ?? undefined // Also apply nullish coalescing here
        } 
      );
    } catch (updateError) {
      console.error(`[BackgroundProcess] CRITICAL: Failed to update sermon ${sermonId} with error status:`, updateError);
    }
  } finally {
    // Dispatch FINISH_PROCESSING, ensuring payload error is string | undefined
    let dispatchPayload: { error?: string } | undefined = undefined;
    if (finalError) {
      dispatchPayload = { error: finalError ?? undefined }; 
    }
    dispatch({ 
      type: 'FINISH_PROCESSING', 
      payload: dispatchPayload
    });
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