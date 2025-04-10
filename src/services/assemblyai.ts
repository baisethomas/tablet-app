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
export interface Word {
  text: string;
  start: number;
  end: number;
  confidence: number;
  speaker?: string | null; // If speaker_labels is enabled
}

export interface Paragraph {
  text: string;
  start: number;
  end: number;
  confidence: number;
  words: Word[];
  speaker?: string | null; // If speaker_labels is enabled
}

export interface TranscriptionResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string; // Full transcript text
  error?: string;
  paragraphs?: Paragraph[]; // Added for paragraph data
  words?: Word[]; // Added for word-level data
  // Add other potential fields if needed (e.g., utterance level data if speaker_labels enabled)
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
    console.log(`[AssemblyAI] Submitting job with audio_url: ${audioUrl}`);
    const response = await fetch(`${BASE_URL}/transcript`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
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

// Define the response structure for the paragraphs endpoint
interface ParagraphsResponse {
    paragraphs: Paragraph[];
    // May include other fields like id, confidence, audio_duration from the docs
}

// Function to poll the status and fetch paragraphs on completion
export async function pollBatchJobStatus(jobId: string): Promise<TranscriptionResponse> {
  if (!API_KEY) throw new Error('AssemblyAI API Key not available.');

  const pollInterval = 5000;
  const maxAttempts = 60;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    console.log(`Polling status for job ID: ${jobId} (Attempt ${attempt})`);
    try {
      // 1. Poll the main transcript endpoint
      const pollResponse = await fetch(`${BASE_URL}/transcript/${jobId}`, {
        headers: { 'Authorization': API_KEY },
      });
      const body: TranscriptionResponse = await pollResponse.json();
      console.log('Poll response status:', pollResponse.status, 'Job status:', body.status);

      if (!pollResponse.ok) {
        if (body.status === 'error') return body; // Return final error status
        throw new Error(`Failed to get transcription status: ${body.error || pollResponse.statusText}`);
      }

      // 2. Check status and fetch paragraphs if completed
      if (body.status === 'completed') {
        console.log(`Job ${jobId} completed. Fetching paragraphs...`);
        try {
          const paragraphsResponse = await fetch(`${BASE_URL}/transcript/${jobId}/paragraphs`, {
            headers: { 'Authorization': API_KEY },
          });
          if (!paragraphsResponse.ok) {
            const paraErrorBody = await paragraphsResponse.json().catch(() => ({})); // Catch JSON parse error
            console.error('Failed to fetch paragraphs body:', paraErrorBody);
            throw new Error(`Failed to fetch paragraphs: ${paraErrorBody.error || paragraphsResponse.statusText}`);
          }
          const paragraphsData: ParagraphsResponse = await paragraphsResponse.json();
          
          // Combine the original response body with the paragraphs
          const finalResponse: TranscriptionResponse = {
            ...body, // Includes id, status, text, words etc.
            paragraphs: paragraphsData.paragraphs, // Add the paragraphs array
          };
          console.log(`Successfully fetched paragraphs for job ${jobId}.`);
          return finalResponse;
          
        } catch (paraError: any) {
          console.error(`Error fetching paragraphs for completed job ${jobId}:`, paraError);
          // Return the original completed response but log the error fetching paragraphs
          // Or potentially mark it as an error? For now, return completed without paragraphs.
          return { ...body, error: `Completed, but failed to fetch paragraphs: ${paraError.message}` }; 
        }
      }
      
      if (body.status === 'error') {
        return body; // Return final error status
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