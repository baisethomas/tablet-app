import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/contexts/theme-context';
import { RecordingProvider } from './src/contexts/recording-context';
import { AppNavigator } from './src/navigation/app-navigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { RecordingStatusBar } from './src/components/ui/RecordingStatusBar';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RecordingProvider>
          <ErrorBoundary>
            <StatusBar style="auto" />
            <AppNavigator />
            <RecordingStatusBar />
          </ErrorBoundary>
        </RecordingProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
