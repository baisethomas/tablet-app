import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.ASSEMBLYAI_API_KEY;
const BASE_URL = "https://api.assemblyai.com/v2";

if (!API_KEY) {
  throw new Error('AssemblyAI API key is not configured. Please check your .env file and app.config.js');
}

interface TranscriptionResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  error?: string;
}

export async function transcribeAudio(fileUri: string): Promise<string> {
  try {
    // Get file info for debugging
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    console.log('Uploading file:', fileInfo);

    // Upload using FileSystem.uploadAsync
    const uploadResponse = await FileSystem.uploadAsync(`${BASE_URL}/upload`, fileUri, {
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'audio/wav',
      },
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT
    });

    console.log('Upload response:', uploadResponse);

    if (!uploadResponse.status || uploadResponse.status >= 400) {
      throw new Error(`Upload failed: ${uploadResponse.body}`);
    }

    const { upload_url } = JSON.parse(uploadResponse.body);

    // Start transcription
    const transcriptResponse = await fetch(`${BASE_URL}/transcript`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        format_text: true,
        language_code: 'en'
      }),
    });

    if (!transcriptResponse.ok) {
      const error = await transcriptResponse.json();
      throw new Error(`Failed to start transcription: ${error.error || transcriptResponse.statusText}`);
    }

    const { id } = await transcriptResponse.json();

    // Poll for transcription completion
    let transcription: TranscriptionResponse;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await fetch(`${BASE_URL}/transcript/${id}`, {
        headers: {
          'Authorization': API_KEY,
        },
      });

      if (!statusResponse.ok) {
        const error = await statusResponse.json();
        throw new Error(`Failed to get transcription status: ${error.error || statusResponse.statusText}`);
      }

      transcription = await statusResponse.json();
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