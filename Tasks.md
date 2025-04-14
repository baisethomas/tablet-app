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
    *   ✅ Verify playback works correctly after migrating files to clean setup.
*   ✅ **Global Recording Flow:** Refactor recording to be globally managed.
    *   ✅ Implement `RecordingContext` (state, reducer, provider).
    *   ✅ Implement `startRecording` (permissions, placeholder sermon, navigate to Notes).
    *   ✅ Implement `stopRecordingAndProcess` (trigger background processing).
    *   ✅ Implement `RecordingStatusBar` UI.
    *   ✅ Refactor Home Screen record button.
    *   ✅ Implement background processing status feedback (Storage + UI).
    *   ✅ Pause/Resume reliability check.
    *   ⏳ Background processing robustness (notifications?).
*   ✅ **Error Handling:** Implement robust error handling.
    *   ✅ Consistent UI (`ErrorDisplay`).
    *   ✅ Specific API/Storage messages.
    *   ✅ Global `ErrorBoundary`.
*   ✅ **Bible Service Improvements:**
    *   ✅ Refactor API request functions (`fetchPassage`, `fetchVerse`)
    *   ✅ Implement verse range detection and handling
    *   ✅ Add retry logic with exponential backoff
    *   ✅ Implement caching layer for scripture content
    *   ✅ Enhance error handling and user feedback in `ScriptureModal`

---

## Cloud Integration (Supabase)

*   🔄 **Cloud Persistence & Sync:**
    *   🔄 Setup & Configuration (Project, Packages, iOS Setup - needs Android)
    *   ✅ Authentication (Context, Screens, Navigation, Sign Out - basic iOS done)
    *   ⏳ Storage (Audio File Upload/Download)
    *   ⏳ Security Rules

---

## UI/UX Enhancements

*   ✅ Improve Transcription UI Feedback (Loading/Processing states in `TranscriptionScreen` - Partially done, review needed).
*   ✅ **Transcription History/Library:** Improve UI for sermon list on `HomeScreen`.
    *   ✅ Refactor list rendering using `SectionList`.
    *   ✅ Refine card styling to match target UI.
*   ✅ Refine UI Consistency Across Screens (Styles, Spacing, Borders - Ongoing).
*   ✅ Replace Emoji Icons with Vector Icons (`@expo/vector-icons`).
*   ✅ Enhance Transcript Display (Paragraph formatting with clickable timestamps).
*   ✅ Review and refine Home Screen UI (inspired by Otter.ai mocks - partially addressed by card styling).
*   ✅ Keyboard dismissal in Notes tab (Verified - was previously paused).
*   ✅ Fix metadata layout shift during title editing on Sermon Detail screen.
*   ✅ Implement basic Account Screen (User Info, Theme Toggle, Clear Data, Sign Out).

---

## Launch Readiness Checklist

*   🔄 **Critical Features & Functionality**
    *   ⏳ Data Persistence & Sync
        - Complete Supabase integration
        - Implement offline support
        - Add data sync conflict resolution
        - Test sync reliability
    *   ⏳ Error Recovery
        - Add retry mechanisms for failed API calls
        - Implement offline queuing for operations
        - Add user feedback for recovery actions
    *   ⏳ Background Processing
        - Add notifications for completed transcriptions
        - Implement proper background task handling
        - Test battery impact

*   🔄 **User Experience & Polish**
    *   ⏳ Loading States
        - Add loading skeletons for all async operations
        - Implement proper loading indicators
        - Add progress indicators for long operations
    *   ⏳ Error States
        - Design and implement error pages
        - Add retry mechanisms in UI
        - Improve error messages for users
    *   ⏳ Empty States
        - Design and implement empty state screens
        - Add proper onboarding flow
        - Implement helpful hints/tooltips

*   🔄 **Performance & Optimization**
    *   ⏳ Audio Handling
        - Implement audio compression
        - Optimize file size for upload
        - Add audio quality settings
    *   ⏳ App Size
        - Optimize asset sizes
        - Remove unused dependencies
        - Configure proper code splitting
    *   ⏳ Memory Management
        - Implement proper cleanup in components
        - Handle large transcripts efficiently
        - Monitor and optimize memory usage

*   🔄 **Testing & Quality Assurance**
    *   ⏳ Device Testing
        - Test on various iOS devices
        - Verify iPad compatibility
        - Test different iOS versions
    *   ⏳ Network Testing
        - Test poor network conditions
        - Verify offline functionality
        - Test sync recovery
    *   ⏳ Edge Cases
        - Test very long sermons
        - Test various audio formats
        - Test concurrent operations

*   🔄 **Security & Data Protection**
    *   ⏳ Data Security
        - Implement proper data encryption
        - Secure API keys and secrets
        - Add proper authentication flows
    *   ⏳ Privacy
        - Add privacy policy
        - Implement data deletion
        - Add user data export

*   🔄 **App Store Preparation**
    *   ⏳ Store Assets
        - Create app icon variations
        - Design screenshots for store
        - Write compelling app description
    *   ⏳ Documentation
        - Create user guide
        - Document known issues
        - Add support information
    *   ⏳ Legal
        - Review and update privacy policy
        - Add terms of service
        - Check compliance requirements

*   🔄 **Launch Infrastructure**
    *   ⏳ Monitoring
        - Set up crash reporting
        - Implement analytics
        - Add performance monitoring
    *   ⏳ Support
        - Set up support system
        - Create FAQ documentation
        - Prepare response templates
    *   ⏳ Deployment
        - Configure CI/CD pipeline
        - Set up beta testing
        - Prepare rollback procedures

*   🔄 **Post-Launch Preparation**
    *   ⏳ Updates
        - Plan first bug fix release
        - Outline feature roadmap
        - Set up beta testing group
    *   ⏳ Marketing
        - Prepare launch announcements
        - Create social media content
        - Plan initial promotion

---

## Technical Debt & Refactoring

*   ✅ Typing (API responses, Props, Contexts).
*   ✅ Logging (Implement more structured logging, potentially integrate Sentry/Expo Error Reporter).
*   ✅ Refactor AsyncStorage access into dedicated utility/hook.
*   ✅ Optimize Recording Settings (review `expo-av` options).
*   ✅ Code Cleanup (remove unused code/comments, ensure consistency).
*   🔄 **Component Directory Restructuring:**
    *   ⏳ Phase 1: Path Alias Setup
        - Configure tsconfig.json with path aliases (@components, @ui, @modals)
        - Update babel config if needed
        - Verify build succeeds with aliases
    *   ⏳ Phase 2: Import Updates
        - Update imports to use new path aliases
        - Verify all components still work
        - Document any issues found
    *   ⏳ Phase 3: Low-Impact Component Migration
        - Move ScriptureModal → @components/modals/ScriptureModal/
        - Move NoteModal → @components/modals/NoteModal/
        - Split into index.tsx, types.ts, styles.ts
        - Verify functionality
    *   ⏳ Phase 4: Medium-Impact Component Migration
        - Move ThemedButton → @components/ui/ThemedButton/
        - Split into index.tsx, types.ts, styles.ts
        - Update all imports
        - Verify button functionality
    *   ⏳ Phase 5: High-Impact Component Migration
        - Move ThemedText → @components/ui/ThemedText/
        - Split into index.tsx, types.ts, styles.ts
        - Update all imports
        - Verify text rendering
    *   ⏳ Phase 6: Audio Component Organization
        - Create @components/audio/ directory
        - Move and restructure AudioPlayer and AudioRecorder
        - Update imports and verify functionality
    *   ⏳ Phase 7: Final Verification
        - Test all main user flows
        - Verify build succeeds
        - Check for console errors
        - Document any remaining issues

---

## Codebase Structure Improvements

*   ⏳ **File Organization:**
    *   ⏳ Consolidate app.config.ts and app.config.js
    *   ⏳ Move global.css to src/styles/ directory
    *   ⏳ Move assets/ inside src/ for better organization
    *   ⏳ Create dedicated directories for different asset types (images, icons, etc.)

*   ⏳ **Type System Enhancement:**
    *   ⏳ Create domain-specific type directories:
        - types/sermon/
        - types/user/
        - types/api/
    *   ⏳ Separate component types into .types.ts files
    *   ⏳ Create shared type definitions for common patterns
    *   ⏳ Add proper type exports/imports structure

*   ⏳ **Testing Infrastructure:**
    *   ⏳ Set up Jest configuration
    *   ⏳ Add jest.setup.ts for global test configuration
    *   ⏳ Create __tests__ directories at:
        - Root level for integration tests
        - Component level for unit tests
        - Screen level for screen tests
    *   ⏳ Add __mocks__ directory for:
        - Service mocks
        - Component mocks
        - Context mocks

*   ⏳ **State Management Structure:**
    *   ⏳ Create store/ directory for state management
    *   ⏳ Organize context providers hierarchically
    *   ⏳ Add proper type definitions for state
    *   ⏳ Create hooks directory for state access

*   ⏳ **API Layer Organization:**
    *   ⏳ Create api/ directory structure:
        - api/client.ts for base configuration
        - api/endpoints/ for API endpoints
        - api/types/ for API-specific types
        - api/transforms/ for data transformation
    *   ⏳ Add proper error handling and types
    *   ⏳ Implement request/response interceptors

*   ⏳ **Constants Management:**
    *   ⏳ Create constants/ directory with subdirectories:
        - constants/sermon/
        - constants/ui/
        - constants/api/
    *   ⏳ Add type definitions for constants
    *   ⏳ Create proper exports structure

*   ⏳ **Navigation Enhancement:**
    *   ⏳ Add type safety to navigation
    *   ⏳ Create dedicated navigation type files
    *   ⏳ Organize routes in a structured way
    *   ⏳ Add navigation constants and helpers

*   ⏳ **Styling System:**
    *   ⏳ Create styles/ directory for shared styles
    *   ⏳ Add theme type definitions
    *   ⏳ Create style utility functions
    *   ⏳ Add style constants and tokens

*   ⏳ **Error Handling System:**
    *   ⏳ Create error/ directory structure:
        - error/types.ts for error types
        - error/handlers.ts for error handlers
        - error/components/ for error UI components
    *   ⏳ Add custom error classes
    *   ⏳ Implement global error boundary
    *   ⏳ Add error logging and reporting

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
*   ✅ **Firebase Build Issues (iOS):** Resolved Pod installation conflicts (`use_modular_headers!`, config errors).
*   ✅ Fixed Bible verse range handling in `bibleService.ts`
*   ✅ Improved error handling in `ScriptureModal`

---

## Testing

*   ⏳ Device Testing (iOS/Android, different screen sizes).
*   ⏳ Unit/Integration Tests (Jest, React Native Testing Library, Detox).

---

## Future Features (Post-MVP)

*   ⏳ Real-time Transcription (WebSockets).
*   ~~⏳ Cloud Persistence & Sync (Firebase Firestore/Auth/Storage).~~ (Moved to Core Features/Cloud Integration)
*   ⏳ Advanced Note Integration (Timestamps, Search within notes/transcript).
*   ⏳ Implement Sermon Deletion Functionality (New).
*   ⏳ Performance Optimization (Audio Compression, Offline Support).
*   ⏳ Accessibility Enhancements (Screen reader, font scaling review).
*   ⏳ UI Polishing & Animations (`react-native-reanimated`).
*   ⏳ Add Speaker field/functionality.
*   ⏳ Keyword Extraction & Display (Placeholder removed - needs planning).
*   ⏳ **Transcription History/Library:** Improve how the list of saved sermons is displayed on the `HomeScreen`.