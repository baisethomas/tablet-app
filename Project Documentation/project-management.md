# Project Management

Got it! Here's the updated section with the tech stack and additional technologies:

---

## **Project Document: "Tablet" Sermon Note-Taking App**

### **Overview**
"Tablet" is an intuitive, minimalistic note-taking app designed to help churchgoers engage more deeply during live sermons. The app automatically transcribes sermons in real time and generates summaries for easy later review. Users can add personal notes, reflections, and prayer requests, all within a simple and distraction-free interface. The app is designed for tech-savvy users who prefer a clean, streamlined experience.

### **User Personas**
1. **Tech-Savvy Congregant**
   - Age: 20–40
   - Regular churchgoer who is comfortable using tech tools for productivity (e.g., Otter.ai, Microsoft Teams)
   - Seeks an efficient way to capture sermon highlights without distraction
   - Values seamless experience and minimal clicks

2. **Active Note-Taker**
   - Age: 25–45
   - Professional or student who takes notes regularly and wants to stay organized
   - Uses the app to jot down key sermon points and personal reflections during the service

3. **Spiritual Seeker**
   - Age: 30–60
   - Uses the app to help engage more deeply during worship, adding personal thoughts and reflections
   - May not be very tech-savvy but seeks an easy-to-use, intuitive experience

### **Core Features**
1. **Real-Time Transcription & Auto-Summary**  
   - Automatically transcribes the sermon in real time  
   - Auto-generates a summary once the sermon ends

2. **Minimalist Design**  
   - Clean, distraction-free interface with a "tablet-like" feel  
   - Color scheme: Calm blues, grays, and earth tones  
   - Support for dark mode and high-contrast mode

3. **Note-Taking Options**  
   - Users can add personal notes during the sermon  
   - A section for reflections, questions, or prayer requests  
   - Plain text notes (with future option for formatting)

4. **Search & Filter Sermons**  
   - Search past sermons by keywords (e.g., topic, date)  
   - Filter by speaker, ministry, or event

5. **Offline Mode & Cloud Storage**  
   - Sermons and notes saved in the cloud with offline access  
   - Data syncs when internet connection is restored

### **Future Features**
- **Voice Commands/Dictation** (Future): Users can dictate notes via voice commands  
- **Social Media Sharing** (Future): Share sermon highlights or reflections  
- **Integration with Church Tools** (Future): Sync with church calendars, event lists, etc.  
- **Expanded Content** (Future): Devotionals, Bible study materials, and small group sharing

### **Technical Requirements**
- **Platform Support**: iOS, Android (cross-platform)  
- **Tech Stack**:  
   - **React Native** (for cross-platform app development)  
   - **Expo** (for easier development and deployment)  
   - **Firebase** (for user authentication, real-time database, and cloud storage)  
   - **Audio Transcription API** (for real-time sermon transcription; e.g., Google Cloud Speech-to-Text, IBM Watson, or similar)  
   - **Cloud Storage**: Firebase Storage (for storing recorded audio and sermon data)  
   - **Push Notifications** (for reminders or new sermon content availability)

- **Accessibility**: Font scaling, screen reader support, and high-contrast mode

- **Security**: Firebase Authentication (for account creation and login), basic encryption for user data storage

### **UI Improvements Based on Otter.ai**
The UI design will draw direct inspiration from Otter.ai while maintaining our original color scheme of calm blues, grays, and earth tones. Key improvements include:

#### **Scripture Highlighting Options**
- **Subtle Background Color**: Light background color for scripture text
- **Typography Differentiation**: Italic or semi-bold styling for scripture text
- **Left Border**: Vertical accent line beside scripture passages
- **Reference Tags**: Small pill-shaped tags showing scripture references
- **Interactive Elements**: Tappable scripture to show full passage context

#### **Home Screen**
- **Clean Card List**: Card-based list of recent sermons
- **Floating Action Button**: Prominent circular button for starting new recordings
- **Recent Activity**: Recently recorded sermons with preview text and date
- **Search Bar**: Persistent search bar with filter options
- **Empty State**: Engaging design for first-time users

#### **Transcription View**
- **Real-time Blocks**: Clean paragraph blocks with timestamps
- **Speaker Identification**: Visual indicators for different speakers
- **Waveform Visualization**: Audio waveform display during recording
- **Quick Actions**: Floating action buttons for recording controls
- **Notes Integration**: Inline note-taking alongside transcription
- **Recording Status**: Prominent recording indicator with duration

#### **Notes Functionality**
- **Inline Notes**: Notes added directly within the transcription
- **Quick Tags**: Tagging system for marking important moments
- **Highlights**: Text highlighting for key points
- **Note Cards**: User notes displayed as distinct cards
- **Export Options**: Export notes separately or with transcript

#### **Organization**
- **Folders**: Folder organization for sermons
- **Smart Folders**: Auto-categorization by speaker, date, church
- **List/Grid Toggle**: Switch between list and grid views
- **Sort Options**: Sort by date, title, duration, etc.
- **Favorites**: Mark sermons as favorites

---
