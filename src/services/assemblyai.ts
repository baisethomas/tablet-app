import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.ASSEMBLYAI_API_KEY;
const BASE_URL = "https://api.assemblyai.com/v2";

if (!API_KEY) {
  console.error('AssemblyAI API key is missing! Check environment config.');
  // Avoid throwing here to allow app to potentially load, but log error
  // throw new Error('AssemblyAI API key is not configured...');
}

// Reusable interface for the transcription response object
export interface TranscriptionResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  error?: string;
  // Add other potential fields if needed based on AssemblyAI docs
}

// Function to upload the audio file
export async function uploadAudioFile(fileUri: string): Promise<string> {
  if (!API_KEY) throw new Error('AssemblyAI API Key not available.');

  console.log('Uploading file:', fileUri);
  try {
    const uploadResponse = await FileSystem.uploadAsync(`${BASE_URL}/upload`, fileUri, {
      headers: {
        'Authorization': API_KEY,
        // Explicitly set Content-Type for WAV file
        'Content-Type': 'audio/wav',
      },
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT
    });

    console.log('Upload response status:', uploadResponse.status);

    if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
       console.error('Upload failed body:', uploadResponse.body);
       throw new Error(`Upload failed with status ${uploadResponse.status}: ${uploadResponse.body}`);
    }

    const body = JSON.parse(uploadResponse.body);
    if (!body.upload_url) {
        console.error('Upload URL missing in response:', body);
        throw new Error('Upload completed but no upload_url received.')
    }
    return body.upload_url;

  } catch (error) {
    console.error('Error during audio upload:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

// Function to submit the transcription job
export async function submitBatchJob(audioUrl: string): Promise<string> {
  if (!API_KEY) throw new Error('AssemblyAI API Key not available.');
  
  console.log('Submitting job for audio URL:', audioUrl);
  try {
    const response = await fetch(`${BASE_URL}/transcript`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        // Add other parameters as needed (language_code, speaker_labels etc.)
        // language_code: 'en' 
      }),
    });

    const body = await response.json();
    console.log('Submit response status:', response.status);

    if (!response.ok) {
      console.error('Submit job failed body:', body);
      throw new Error(`Failed to submit transcription job: ${body.error || response.statusText}`);
    }

    if (!body.id) {
        console.error('Job ID missing in response:', body);
        throw new Error('Job submitted but no ID received.')
    }
    return body.id;

  } catch (error) {
    console.error('Error submitting transcription job:', error);
    throw error;
  }
}

// Function to poll the status of a transcription job until completion or error
export async function pollBatchJobStatus(jobId: string): Promise<TranscriptionResponse> {
  if (!API_KEY) throw new Error('AssemblyAI API Key not available.');

  const pollInterval = 5000; // Poll every 5 seconds
  const maxAttempts = 60; // Max attempts (e.g., 5 minutes)
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    console.log(`Polling status for job ID: ${jobId} (Attempt ${attempt})`);
    try {
      const response = await fetch(`${BASE_URL}/transcript/${jobId}`, {
        headers: {
          'Authorization': API_KEY,
        },
      });

      const body: TranscriptionResponse = await response.json();
      console.log('Poll response status:', response.status, 'Job status:', body.status);

      if (!response.ok) {
        console.error('Poll job status failed body:', body);
        // Check if body contains final error status from AssemblyAI
        if (body.status === 'error') {
            console.warn(`Polling failed but received final error status: ${body.error}`);
            return body; // Return the final error status object
        }
        // If not a final error status, treat as network/API error
        throw new Error(`Failed to get transcription status: ${body.error || response.statusText}`);
      }

      // Check if job is completed or failed
      if (body.status === 'completed' || body.status === 'error') {
        return body; // Return the final result (success or error)
      }

      // If still queued or processing, wait and poll again
      await new Promise(resolve => setTimeout(resolve, pollInterval));

    } catch (error: any) {
      // Handle network errors during polling
      console.error(`Error during polling attempt ${attempt}:`, error);
      // Optional: Implement retry logic for transient network errors here
      // If it's the last attempt, re-throw the error
      if (attempt === maxAttempts) {
         throw new Error(`Failed to get transcription status after ${maxAttempts} attempts: ${error.message}`);
      }
      // Wait before the next attempt even if there was an error
      await new Promise(resolve => setTimeout(resolve, pollInterval)); 
    }
  }

  // If loop finishes without completion/error, throw timeout error
  throw new Error(`Transcription job timed out after ${maxAttempts * pollInterval / 1000} seconds.`);
}

// The old combined function (can be removed or kept for other uses)
/*
export async function transcribeAudio(fileUri: string): Promise<string> {
  try {
    const upload_url = await uploadAudioFile(fileUri);
    const id = await submitBatchJob(upload_url);

    let transcription: TranscriptionResponse;
    do {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Poll every 3 seconds
      transcription = await pollBatchJobStatus(id);
    } while (transcription.status === 'queued' || transcription.status === 'processing');

    if (transcription.status === 'error') {
      throw new Error(transcription.error || 'Transcription failed');
    }

    return transcription.text || '';
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}
*/ 