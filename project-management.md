# Tablet Sermon Note-Taking App

## Project Overview
A mobile application for taking sermon notes with real-time transcription capabilities, built with React Native and Expo.

## Current Implementation

### Core Features
1. **Theme System**
   - Light/Dark mode support
   - Custom color palettes
   - Context-based theme management

2. **Navigation**
   - Stack-based navigation
   - Home screen with main actions
   - Transcription test screen

3. **Audio Recording & Transcription**
   - Audio recording using expo-av
   - AssemblyAI integration for transcription
   - Proper audio format handling (16kHz, 16-bit PCM)
   - File upload and transcription service

### Technical Implementation

#### Audio Recording
- Uses `expo-av` for audio capture
- Configures optimal recording settings:
  - 16kHz sample rate
  - 16-bit PCM format
  - Mono channel
  - WAV file format
- Handles permissions and recording lifecycle

#### AssemblyAI Integration
- REST API-based transcription service
- Two-step process:
  1. Upload audio file
  2. Transcribe and poll for results
- Proper error handling and status management
- Secure API key management

#### UI Components
- `AudioRecorder`: Handles recording and transcription
- `TranscriptionTestScreen`: Test interface for transcription
- Status indicators for recording and processing states

## Next Steps

### Immediate Tasks
1. **Error Handling**
   - Implement retry mechanism for failed uploads
   - Add user-friendly error messages
   - Handle network connectivity issues

2. **UI Improvements**
   - Add progress indicators for transcription
   - Implement transcription history
   - Add audio playback controls

3. **Testing**
   - Test on different devices
   - Verify audio quality
   - Check transcription accuracy

### Future Enhancements
1. **Real-time Transcription**
   - Implement WebSocket-based real-time transcription
   - Add partial transcript display
   - Optimize audio streaming

2. **Note Integration**
   - Link transcriptions to sermon notes
   - Add timestamp-based navigation
   - Implement search functionality

3. **Performance Optimization**
   - Implement audio compression
   - Add offline support
   - Optimize file handling

## Technical Debt
1. **Type Definitions**
   - Add proper types for AssemblyAI responses (Partially addressed for RealtimeTranscript)
   - Improve error type handling
   - Document API interfaces
2. **Code Organization**
   - Move API keys to environment variables (Done via `expo-constants`)
   - Implement proper service layer (Partially done for pre-recorded in `src/services/assemblyai.ts`)
   - Add comprehensive logging (Basic error logging remains after debug cleanup)
3. **Transcription UI Refinement:**
   - Further enhance the real-time display for maximum fluidity.
   - Consider visual cues for speaker pauses or utterance ends.

## Known Issues
1. Audio file upload size limitations (For pre-recorded)
2. Network dependency for transcription (Applies to both modes)
3. Potential memory issues with large recordings (More relevant for pre-recorded or very long real-time sessions)
4. **Real-time Transcription Coherence:** Due to the chunk-based audio capture required by `expo-av` (vs. true streaming), the real-time transcription might not be perfectly word-for-word smooth. The current display logic mitigates this visually, but minor delays or boundary artifacts inherent to chunking can occur.
5. **iOS Audio Session Errors:** Resolved through careful configuration of `Audio.setAudioModeAsync` and `recording.prepareToRecordAsync` with explicit `.wav`/PCM settings. Initial implementation faced `NSOSStatusErrorDomain Code=1718449215`.
6. **Incorrect Audio Format:** Resolved by forcing `.wav` format recording. Initial attempts using `HIGH_QUALITY` preset resulted in `.m4a` files and empty transcripts from AssemblyAI.

## Dependencies
- expo-av: ^15.0.2
- expo-file-system: ^15.0.2
- @react-navigation/native: ^6.0.0
- @react-navigation/native-stack: ^6.0.0
- react-native-safe-area-context: ^4.0.0

## API Integration
### AssemblyAI
- Base URL: https://api.assemblyai.com/v2
- Endpoints:
  - POST /upload: Upload audio file (For pre-recorded)
  - POST /transcript: Start transcription (For pre-recorded)
  - GET /transcript/{id}: Get transcription status (For pre-recorded)
  - POST /v2/realtime/token: Obtain temporary token for WebSocket
  - WSS wss://api.assemblyai.com/v2/realtime/ws: Real-time transcription WebSocket
- Authentication: API key in Authorization header (REST) or via token (WebSocket)
- **Real-time Implementation (`src/components/AudioRecorder.tsx`):**
  - Uses Expo AV (`expo-av`) to record audio chunks from the microphone.
  - Connects to AssemblyAI WebSocket endpoint using a temporary token.
  - Records audio in fixed intervals (`RECORDING_INTERVAL_MS`) to `.wav` files (16kHz, mono, 16-bit PCM).
  - Reads each chunk file as Base64 using `expo-file-system`.
  - Sends Base64 audio data via WebSocket message `{"audio_data": "..."}`.
  - Handles `PartialTranscript` and `FinalTranscript` messages to display results.
  - Implements specific display logic to differentiate between final and partial text for better coherence.
- Rate Limits: Standard tier limits apply 