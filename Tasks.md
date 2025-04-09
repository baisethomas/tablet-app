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

*   ✅ **Audio Recording:** Implement basic recording using `expo-av`.
*   ✅ **Batch Transcription:** Integrate AssemblyAI batch workflow (Upload -> Submit -> Poll).
*   ✅ **Local Sermon Storage:** Save Transcript, Notes, and **Audio URL** to `AsyncStorage`.
*   ✅ **Library Screen:** Fetch and display list of saved sermons from `AsyncStorage`.
*   ✅ **Sermon Detail Screen:** Framework with Tab Navigator.
*   ✅ **Transcript Tab:** Display saved transcript text.
*   ✅ **Notes Tab:** Implement viewing, editing, and saving notes to `AsyncStorage`.
*   🔄 **Audio Playback:**
    *   ✅ Implement core playback logic (`expo-av` sound loading, status updates, play/pause) in `TranscriptTab`.
    *   ✅ Integrate player UI (Progress bar, time, button) into `TranscriptTab`.
    *   ⏳ Verify playback works correctly after migrating files to clean setup.
*   ⏳ **Summary Tab:** Placeholder, functionality TBD (AI integration is future).
*   ⏳ **Error Handling:** Implement robust error handling for recording, API calls, and storage.
    *   ⏳ User-friendly error messages.
    *   ⏳ Retry mechanism for failed uploads/API calls.
    *   ⏳ Network connectivity checks.

---

## UI/UX Enhancements

*   ⏳ Improve Transcription UI Feedback (Loading/Processing states in `TranscriptionScreen`).
*   ⏳ Implement Transcription History View (Enhance `LibraryScreen` or new screen).
*   ⏳ Refine UI Consistency Across Screens (Styles, Spacing, Borders).
*   ⏳ Implement Player Seeking/Scrubbing functionality.
*   ⏳ Add Skip Forward/Backward Buttons to player.
*   ⏳ Enhance Transcript Display (e.g., Speaker Labels if API provides, Highlighting).
*   ⏳ Review and refine Home Screen UI (inspired by Otter.ai mocks).

---

## Technical Debt & Refactoring

*   ⏳ Add Proper Typing (AssemblyAI responses, Component Props).
*   ⏳ Improve Error Type Handling System-wide.
*   ⏳ Add Comprehensive Logging (Consider Sentry).
*   ⏳ Refactor `AsyncStorage` Logic (Consider Custom Hook or Service).
*   ⏳ Refactor Audio Playback Logic (Consider Custom Hook).
*   ⏳ Document Service Layer/API Interfaces.
*   ⏳ Review and Optimize `expo-av` Recording Settings for Quality/Compatibility.

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

*   ⏳ Test Recording & Playback on Different Devices (iOS/Android).
*   ⏳ Verify Audio Quality Across Devices.
*   ⏳ Check Transcription Accuracy with Various Inputs.
*   ⏳ Add Unit/Integration Tests (Jest, RTL, Detox).

---

## Future Features (Post-MVP)

*   ⏳ Real-time Transcription (WebSockets).
*   ⏳ Cloud Persistence & Sync (Firebase Firestore/Auth/Storage).
*   ⏳ Advanced Note Integration (Timestamps, Search within notes/transcript).
*   ⏳ Performance Optimization (Audio Compression, Offline Support).
*   ⏳ Accessibility Enhancements (Screen reader, font scaling review).
*   ⏳ UI Polishing & Animations (`react-native-reanimated`).
*   ⏳ Add Speaker field/functionality.