# Project Tasks: Tablet Sermon Note-Taking App

This document tracks completed and pending tasks for the project.

**Status Legend:**
*   ✅: Done
*   🔄: In Progress / Needs Verification
*   ⏳: Pending / To Do

---

## Setup & Configuration

*   ✅ Project Initialization (Expo Blank TypeScript Template)
*   ✅ Environment Variables Setup (`.env`, `.env.example`, `expo-constants`)
*   ✅ Git Repository Setup (`.gitignore`)
*   ✅ Basic Core Dependencies Installed (`expo-av`, navigation, etc.)
*   ✅ Theme System Setup (`theme-context`, `useThemeStyles`)
*   ✅ Basic Navigation Structure (`app-navigator`, Stack, Top Tabs)

---

## Core Features & Functionality

*   ✅ **Recording & Transcription:** Core audio recording, AssemblyAI upload, batch transcription polling.
*   ✅ **AI Summary Generation:** Implemented OpenAI summary generation (Overview, Scriptures, Key Points) in `SummaryTab`.
*   ✅ **Notes Tab:** Implement viewing, editing, and saving notes to `AsyncStorage`.
*   ✅ **Audio Playback:**
    *   ✅ Implement core playback logic (`expo-av`) via `useAudioPlayer` hook.
    *   ✅ Integrate player UI (Slider, time, buttons) into `TranscriptTab`.
    *   ✅ Implement seeking/scrubbing & Skip buttons.
    *   ⏳ Verify playback works correctly after migrating files to clean setup.
*   ✅ **Global Recording Flow:** Refactor recording to be globally managed.
    *   ✅ Implement `RecordingContext` (state, reducer, provider).
    *   ✅ Implement `startRecording` (permissions, placeholder sermon, navigate to Notes).
    *   ✅ Implement `stopRecordingAndProcess` (trigger background processing).
    *   ✅ Implement `RecordingStatusBar` UI.
    *   ✅ Refactor Home Screen record button.
    *   ⏳ Pause/Resume reliability check.
    *   ⏳ Background processing robustness (notifications?, error state in sermon record?).
*   ✅ **Error Handling:** Implement robust error handling.
    *   ✅ Consistent UI (`ErrorDisplay`).
    *   ✅ Specific API/Storage messages.
    *   ✅ Global `ErrorBoundary`.

---

## UI/UX Enhancements

*   ⏳ Improve Transcription UI Feedback (Loading/Processing states in `TranscriptionScreen` - Partially done, review needed).
*   ✅ **Transcription History/Library:** Improve UI for sermon list on `HomeScreen`.
    *   ✅ Refactor list rendering using `SectionList`.
    *   ✅ Refine card styling to match target UI.
*   ⏳ Refine UI Consistency Across Screens (Styles, Spacing, Borders - Ongoing).
*   ✅ Replace Emoji Icons with Vector Icons (`@expo/vector-icons`).
*   ⏳ Enhance Transcript Display (e.g., Speaker Labels if API provides, Highlighting).
*   ⏳ Review and refine Home Screen UI (inspired by Otter.ai mocks - partially addressed by card styling).
*   ⏳ Keyboard dismissal in Notes tab (paused).

---

## Technical Debt & Refactoring

*   ⏳ Typing (API responses, Props, Contexts).
*   ⏳ Logging (Implement more structured logging, potentially integrate Sentry/Expo Error Reporter).
*   ⏳ Refactor AsyncStorage access into dedicated utility/hook.
*   ⏳ Optimize Recording Settings (review `expo-av` options).
*   ⏳ Code Cleanup (remove unused code/comments, ensure consistency).

---

## Bug Fixes & Resolved Issues (Recent)

*   ✅ Fixed iOS Audio Session Errors during recording setup.
*   ✅ Fixed Incorrect Audio Format being recorded (`.wav` 16kHz/16-bit).
*   ✅ Fixed Transcript Display Color Contrast issue.
*   ✅ Resolved TypeScript Declaration Errors (React, React Nav, NativeWind remnants).
*   ✅ Fixed Sermon Detail Tab Rendering Issues (Related to TS errors).
*   ✅ Fixed AssemblyAI Upload Error (Added `Content-Type` header).
*   ✅ Fixed Missing Audio URL during Sermon Save (Passed URI via params).
*   ✅ Fixed `colors` Scope Error in `TranscriptTab` `useStyles`.
*   ✅ Fixed `Text strings must be rendered...` Warning (Formatted/Removed comments).
*   ✅ Resolved `react-native-reanimated` Build Error (`./publicGlobals`).

---

## Testing

*   ⏳ Device Testing (iOS/Android, different screen sizes).
*   ⏳ Unit/Integration Tests (Jest, React Native Testing Library, Detox).

---

## Future Features (Post-MVP)

*   ⏳ Real-time Transcription (WebSockets).
*   ⏳ Cloud Persistence & Sync (Firebase Firestore/Auth/Storage).
*   ⏳ Advanced Note Integration (Timestamps, Search within notes/transcript).
*   ⏳ Performance Optimization (Audio Compression, Offline Support).
*   ⏳ Accessibility Enhancements (Screen reader, font scaling review).
*   ⏳ UI Polishing & Animations (`react-native-reanimated`).
*   ⏳ Add Speaker field/functionality.
*   ⏳ **Transcription History/Library:** Improve how the list of saved sermons is displayed on the `HomeScreen`.