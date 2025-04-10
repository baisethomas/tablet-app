# Tablet - Sermon Note-Taking App

A minimalist sermon note-taking app that automatically transcribes sermons in real time, generates summaries, and allows users to add personal notes, reflections, and prayer requests.

## Project Structure

- `/src/components`: Reusable UI components
- `/src/screens`: App screens
- `/src/navigation`: Navigation configuration
- `/src/hooks`: Custom React hooks
- `/src/contexts`: React context providers
- `/src/utils`: Utility functions
- `/src/types`: TypeScript type definitions
- `/src/theme`: Theming and styling

## Current Implementation

- Basic app structure with TypeScript setup
- Theme system with dark mode support
- Navigation setup with tabs and stacks
- Basic screens:
  - Home screen
  - Transcription screen (placeholder)
  - Library screen (placeholder)
  - Settings screen (placeholder)

## Next Steps

- [ ] Implement Firebase authentication
- [ ] Set up the transcription API integration (Google Cloud Speech-to-Text)
- [ ] Implement note-taking functionality
- [ ] Create sermon storage in Firebase
- [ ] Implement offline mode and data syncing
- [ ] Add search and filter capabilities
- [ ] Enhance UI with animation and gestures
- [ ] Implement accessibility features

## Running the App

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

## Technology Stack

- React Native with Expo
- TypeScript
- React Navigation
- Firebase (authentication, Firestore, storage)
- Google Cloud Speech-to-Text API 

## Styling

This project uses a theme-aware React Native styling approach:

- **Theme Context**: Provides theme data and dark/light mode switching
- **useTheme Hook**: Access colors and theme state in components
- **useThemeStyles Hook**: Create theme-aware StyleSheet objects

### Example Usage

```tsx
import { useThemeStyles } from './src/hooks/useThemeStyles';

function MyComponent() {
  const { createThemedStyles } = useThemeStyles();
  
  const styles = createThemedStyles((colors) => ({
    container: {
      backgroundColor: colors.background.primary,
      padding: 16,
    },
    text: {
      color: colors.text.primary,
      fontSize: 16,
    }
  }));
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Themed text</Text>
    </View>
  );
}
```

See `src/docs/styling-guide.md` for detailed styling documentation. 