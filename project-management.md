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
   - Sermon detail screen with tabbed interface

3. **Audio Recording & Transcription**
   - Audio recording using expo-av
   - AssemblyAI integration for transcription
   - Proper audio format handling (16kHz, 16-bit PCM)
   - File upload and transcription service

4. **Sermon Detail Components**
   - TabView interface for sermon content
   - Audio playback interface with controls (UI only)
   - Transcript display with proper styling
   - Notes editor with save functionality
   - Summary placeholder for future AI features

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
- `AudioTab`: Displays sermon audio with playback controls
- `TranscriptTab`: Displays sermon transcript with scrollable content
- `NotesTab`: Provides editable text input for sermon notes
- `SummaryTab`: Placeholder for future AI-generated summaries

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

4. **TypeScript Fixes**
   - Install required React type declarations (@types/react)
   - Resolve React Navigation type issues
   - Fix component rendering type errors

5. **Sermon Detail Enhancements**
   - Implement actual audio playback functionality
   - Fix sermon data loading issues
   - Improve UI consistency across tabs

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
   - Add proper types for AssemblyAI responses (Batch & Realtime)
   - Improve error type handling
   - Document API interfaces
   - **NEW:** Fix React and React Navigation type declarations
   - **NEW:** Add proper component props typing

2. **Code Organization**
   - Move API keys to environment variables (Done via `expo-constants`)
   - Implement proper service layer (Refactored for batch workflow)
   - Add comprehensive logging (Basic error logging remains)
   - Refactor AsyncStorage access logic (e.g., into hooks or services)
   - **NEW:** Consider custom hook for audio playback functionality

3. **Transcription UI Refinement:**
   - Improve UI feedback during Uploading/Processing states
   - Enhance display of the final transcript (e.g., use theme color instead of black)
   - Consider adding basic audio playback controls
   - Implement persistence for saved transcripts (Basic AsyncStorage saving done)
   - Implement Notes functionality (Done - Basic editing/saving in Detail screen)

## Known Issues
1. Audio file upload size limitations (AssemblyAI limits apply)
2. Network dependency for transcription (Upload, polling)
3. Potential memory issues with very long recordings (Local storage during recording)
4. **iOS Audio Session Errors:** (Resolved)
5. **Incorrect Audio Format:** (Resolved)
6. **Transcription Delay:** User must wait for upload and batch processing after recording stops
7. **Transcript Display Color:** (Resolved) Text color needed adjustment for contrast
8. **TypeScript Declaration Errors:** Missing React and React Navigation type declarations causing compilation errors
9. **Sermon Data Loading:** Some tab components fail to display sermon data correctly
10. **Audio Player Implementation:** Current AudioTab has UI controls but no actual playback functionality
11. **Style Consistency Issues:** Need to ensure consistent use of borders, shadows, and spacing across components
12. **Component Rendering Errors:** JSX elements have type issues in sermon detail components

## Future Enhancements / Proposed Features

### Notes Integration (Completed - Basic)
- **Goal:** Allow users to add and edit manual notes associated with saved transcripts.
- **Implementation:** Added a `notes: string` field to `SavedSermon`. Added `TextInput` and save logic to `SermonDetailScreen` using `AsyncStorage`.
- **Next Steps:** UI refinement, potentially auto-save or debouncing.
- **Status Update:** Improved UI for notes with consistent styling and proper save functionality.

### Audio Player Enhancement (In Progress)
- **Goal:** Provide intuitive audio playback for sermon recordings.
- **Implementation:** Created UI for audio player with progress bar, time indicators, and playback controls.
- **Next Steps:** Implement actual audio playback using Expo AV or React Native Sound.

### Cloud Persistence & Sync (Future)
- **Goal:** Backup transcripts/notes and sync across devices.
- **Approach:** Migrate from `AsyncStorage` to a cloud database like Firebase Firestore. Requires Firebase setup, authentication, and data structure changes.

### Real-time Transcription (Deferred)
- **Goal:** Provide live transcription feedback during recording.
- **Approach:** Use AssemblyAI's WebSocket endpoint (`wss://.../realtime/ws`).
- **Challenges:** Requires chunked audio capture (using `expo-av`), handling partial/final transcripts, managing WebSocket state, potential coherence issues due to chunking (as observed previously). See previous "Hybrid Transcription Approach" plan in commit history for detailed implementation considerations if revisited.

### Hybrid Transcription Approach (Deferred)
- **Goal:** Combine real-time feedback with optional high-accuracy post-processing.
- **Approach:** Run real-time WebSocket transcription *while also* saving the full audio file. Offer a "Finalize" button post-recording to trigger batch processing on the full file for improved accuracy.
- **Challenges:** Increased complexity (managing both processes), doubled API processing costs, temporary local storage for full audio. See previous detailed plan in commit history if revisited.

## Development Progress (April 2023)

### Recently Completed
- ✅ Implemented sermon detail screen with tabbed interface
- ✅ Created NotesTab with proper styling and save functionality
- ✅ Developed TranscriptTab with scrollable content display
- ✅ Implemented AudioTab UI with playback controls (mock implementation)
- ✅ Added consistent styling across tab components
- ✅ Updated documentation with known issues and development status

### In Progress
- 🔄 Fixing TypeScript declaration errors
- 🔄 Debugging sermon data loading issues
- 🔄 Implementing actual audio playback functionality

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
- **Transcription Implementation (Batch - Complete & Notes Implemented Locally):**
  - `AudioRecorder` component records full audio (`.wav`) and provides URI on stop.
  - `TranscriptionScreen` orchestrates batch processing (Upload -> Submit -> Poll -> Display).
  - Completed transcript is saved to `AsyncStorage` (key `"savedSermons"`).
  - `LibraryScreen` fetches and displays a list of saved sermons from `AsyncStorage`.
  - `SermonDetailScreen` fetches and displays the full transcript and details for a selected sermon ID from `AsyncStorage`.
  - `SermonDetailScreen` allows viewing and editing notes associated with the transcript, saving changes back to `AsyncStorage`.
  - UI manages states for recording and batch processing.
  - Service functions handle AssemblyAI API interactions.
  - Temporary audio file is deleted.
- Rate Limits: Standard tier limits apply 

## Styling System
1. **Theme-aware React Native Styling**
   - Uses React Native's native StyleSheet API
   - Theme context provides color palette and dark/light mode
   - Custom hooks (`useTheme`, `useThemeStyles`) for theme integration
   - Detailed documentation in `src/docs/styling-guide.md`

2. **Note on NativeWind Exploration**
   - Initially explored NativeWind (Tailwind for React Native)
   - Encountered TypeScript compatibility issues
   - Integration challenges with project dependencies
   - Documentation of the approach preserved in `src/docs/nativewind-usage.md` 