import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/contexts/theme-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthProvider } from './src/contexts/auth-context/auth-context';
import { RecordingProvider } from './src/contexts/recording-context';
import { AppNavigator } from './src/navigation/app-navigator';
import { RecordingStatusBar } from './src/components/ui/RecordingStatusBar';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <AuthProvider>
              <RecordingProvider>
                <NavigationContainer>
                  <StatusBar style="auto" />
                  <AppNavigator />
                  <RecordingStatusBar />
                </NavigationContainer>
              </RecordingProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}