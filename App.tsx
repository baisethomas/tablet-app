import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/contexts/theme-context';
import { RecordingProvider } from './src/contexts/recording-context';
import { AuthProvider } from './src/contexts/auth-context/auth-context';
import { RootNavigator } from './src/navigation/root-navigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { RecordingStatusBar } from './src/components/ui/RecordingStatusBar';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RecordingProvider>
            <ErrorBoundary>
              <StatusBar style="auto" />
              <RootNavigator />
              <RecordingStatusBar />
            </ErrorBoundary>
          </RecordingProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
