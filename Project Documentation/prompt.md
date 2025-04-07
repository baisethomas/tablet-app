Here's a detailed prompt based on your project plan to be used in Cursor.ai to help guide the development of the "Tablet" app:

---

**Prompt for Cursor.ai**:

---

### **Project Overview**

We are building a sermon note-taking app called "Tablet" designed for churchgoers to engage more deeply with live sermons. The app will automatically transcribe sermons in real time, generate summaries, and allow users to add personal notes, reflections, and prayer requests. The app aims to provide a minimalist, distraction-free interface that enhances the user's spiritual engagement during worship. The app will also display key scripture references within the sermon summary, offering background information and context related to those scriptures to help users better understand the message.

### **Core Features to Implement**:

1. **Real-Time Transcription & Auto-Summary**
   - Integrate a real-time transcription feature that automatically transcribes the sermon as it’s being delivered. The transcription should be accurate, real-time, and capable of handling multiple speakers.
   - Upon the completion of the sermon, the app should auto-generate a concise summary of the sermon content, including key points and scripture references.

2. **Scripture References with Background Context**
   - For each sermon, key scripture references should be highlighted in the summary. Each scripture should come with a brief background explanation, offering cultural, historical, and theological context to the passage to help users understand its relevance to the message.
   - Example: If the sermon includes Matthew 5:14-16, the app should include a brief explanation about the significance of the passage within the context of Jewish expectations of the Messiah and its broader relevance for Christian life today.

3. **Minimalist Design**
   - The app should feature a clean, distraction-free interface that mimics the simplicity of writing on a tablet. 
   - Use calm blues, grays, and earth tones for the color scheme.
   - Provide both dark mode and high-contrast mode for accessibility.

4. **Note-Taking Features**
   - Users should be able to add personal notes, reflections, and prayer requests during the sermon.
   - Notes should be simple and plain text with future options for formatting (bold, italics).
   - Include an easy-to-use interface for quickly jotting down thoughts during the service without distracting the user from the sermon.

5. **Search & Filter Sermons**
   - Provide functionality to search past sermons by keywords such as topic, scripture, speaker, or date.
   - Allow users to filter sermons by speaker, ministry, or event.

6. **Offline Mode & Cloud Storage**
   - Implement offline access to sermon recordings and notes so users can review content even when not connected to the internet.
   - Sync data (audio, notes, summaries) to the cloud when the internet connection is restored, ensuring that all content is securely stored in Firebase.

7. **Voice Dictation (Future Feature)**
   - Integrate voice dictation capabilities that allow users to dictate their notes, rather than typing them. (This will be implemented in a future phase, but should be planned for scalability.)

### **Technology Stack**:

- **React Native**: For cross-platform development (iOS and Android).
- **Expo**: For faster development and deployment.
- **Firebase**: For user authentication (Firebase Authentication), real-time database (Firestore), and cloud storage (Firebase Storage) to save sermon data and notes.
- **Google Cloud Speech-to-Text API** (or IBM Watson, etc.): For real-time transcription of the sermon.
- **Push Notifications**: To notify users about new sermon content, upcoming services, or reminders.
  
### **Accessibility Requirements**:
- Ensure the app supports screen reader functionality and scalable fonts for those with visual impairments.
- High-contrast mode and dark mode should be available for better accessibility.

### **Security**:
- Use Firebase Authentication for secure user login and registration.
- Encrypt sensitive user data stored within the app (e.g., personal notes, reflections).
  
---

**Goals for the App**:
- Provide a clean and efficient note-taking experience for churchgoers, offering both real-time sermon transcription and personalized note-taking.
- Improve user engagement by offering additional insights into scripture references within the sermon summaries.
- Ensure accessibility, security, and ease of use for a broad range of users, from tech-savvy individuals to those less familiar with technology.

### **Future Enhancements (For Later Phases)**:
1. **Voice Commands**: Implement voice command functionality for dictating notes.
2. **Social Media Sharing**: Allow users to share sermon highlights or reflections directly from the app to social media.
3. **Integration with Church Tools**: Sync the app with church calendars, event lists, and sermon archives to provide a more seamless experience for churchgoers.
4. **Expanded Content**: Add Bible study resources, devotionals, and small group sharing features.

---

This prompt should provide clear guidance on the project requirements for building the app. You can adjust any parts as needed depending on your specific use case and future plans. Let me know if you need any other details added!