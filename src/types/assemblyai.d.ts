declare module 'assemblyai' {
  interface AssemblyAIConfig {
    apiKey: string;
  }

  interface TranscribeOptions {
    audio: string;
  }

  interface Transcript {
    text: string;
  }

  interface Transcripts {
    transcribe(options: TranscribeOptions): Promise<Transcript>;
  }

  interface RealtimeTranscriberConfig {
    sampleRate: number;
  }

  interface RealtimeTranscript {
    message_type: 'PartialTranscript' | 'FinalTranscript';
    text: string;
    created: string;
    audio_start?: number;
    audio_end?: number;
  }

  interface RealtimeTranscriber {
    on(event: 'open', callback: (data: { sessionId: string }) => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
    on(event: 'close', callback: (code: number, reason: string) => void): void;
    on(event: 'transcript', callback: (transcript: RealtimeTranscript) => void): void;
    connect(): Promise<void>;
    close(): Promise<void>;
    sendAudio(buffer: Buffer): void;
  }

  interface Realtime {
    transcriber(config: RealtimeTranscriberConfig): RealtimeTranscriber;
  }

  class AssemblyAI {
    constructor(config: AssemblyAIConfig);
    transcripts: Transcripts;
    realtime: Realtime;
  }

  export default AssemblyAI;
} 