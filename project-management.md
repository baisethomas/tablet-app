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
   - Add proper types for AssemblyAI responses (Batch & Realtime).
   - Improve error type handling.
   - Document API interfaces.
2. **Code Organization**
   - Move API keys to environment variables (Done via `expo-constants`).
   - Implement proper service layer (Refactored for batch workflow).
   - Add comprehensive logging (Basic error logging remains).
3. **Transcription UI Refinement:**
   - Improve UI feedback during Uploading/Processing states.
   - Enhance display of the final transcript (e.g., use theme color instead of black).
   - Consider adding basic audio playback controls.
   - Implement persistence for saved transcripts (Basic AsyncStorage saving done).

## Known Issues
1. Audio file upload size limitations (AssemblyAI limits apply).
2. Network dependency for transcription (Upload, polling).
3. Potential memory issues with very long recordings (Local storage during recording).
4. **iOS Audio Session Errors:** (Resolved).
5. **Incorrect Audio Format:** (Resolved).
6. **Transcription Delay:** User must wait for upload and batch processing after recording stops.
7. **Transcript Display Color:** (Resolved) Text color needed adjustment for contrast against background.

## Future Enhancements / Proposed Features

### Real-time Transcription (Deferred)
- **Goal:** Provide live transcription feedback during recording.
- **Approach:** Use AssemblyAI's WebSocket endpoint (`wss://.../realtime/ws`).
- **Challenges:** Requires chunked audio capture (using `expo-av`), handling partial/final transcripts, managing WebSocket state, potential coherence issues due to chunking (as observed previously). See previous "Hybrid Transcription Approach" plan in commit history for detailed implementation considerations if revisited.

### Hybrid Transcription Approach (Deferred)
- **Goal:** Combine real-time feedback with optional high-accuracy post-processing.
- **Approach:** Run real-time WebSocket transcription *while also* saving the full audio file. Offer a "Finalize" button post-recording to trigger batch processing on the full file for improved accuracy.
- **Challenges:** Increased complexity (managing both processes), doubled API processing costs, temporary local storage for full audio. See previous detailed plan in commit history if revisited.

## Dependencies
- expo-av: ^15.0.2
- expo-file-system: ^15.0.2
- @react-navigation/native: ^6.0.0
- @react-navigation/native-stack: ^6.0.0
- react-native-safe-area-context: ^4.0.0

## API Integration
### AssemblyAI
- Base URL: https://api.assemblyai.com/v2
- Endpoints Used (Batch Approach):
  - POST /upload: Upload full audio file after recording stops.
  - POST /transcript: Start batch transcription job using the uploaded audio URL.
  - GET /transcript/{id}: Poll for transcription job status and retrieve results.
- Endpoints (Deferred Real-time):
  - POST /v2/realtime/token: Obtain temporary token for WebSocket.
  - WSS wss://api.assemblyai.com/v2/realtime/ws: Real-time transcription WebSocket.
- Authentication: API key in Authorization header.
- **Transcription Implementation (Batch - Complete & Saving Locally):**
  - `AudioRecorder` component uses `expo-av` to record the full audio to a local `.wav` file and provides a callback with the file URI upon stopping.
  - `TranscriptionScreen` orchestrates the batch processing workflow (Upload -> Submit -> Poll -> Display).
  - Upon successful batch completion, the final transcript is saved locally to `@react-native-async-storage/async-storage` under the key `"savedSermons"` as an array of `SavedSermon` objects.
  - UI (`TranscriptionScreen`) manages states: Idle, Recording, Uploading, Processing, Complete, Error.
  - Service functions (`src/services/assemblyai.ts`) provide modular upload, submit, and poll capabilities.
  - Temporary audio file is deleted after processing.
- Rate Limits: Standard tier limits apply 