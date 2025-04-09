import React, { ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Button, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { useThemeStyles } from '../hooks/useThemeStyles';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    // In development, you might want to log more details
    if (__DEV__) {
      console.log("Error details:", errorInfo.componentStack);
    }
  }

  handleReload = () => {
    if (__DEV__) {
      // In development, trigger a reload using Expo Updates
      Updates.reloadAsync();
    } else {
      // In production, a simple reload might not be enough, 
      // but we can attempt it. 
      // A more robust solution might involve logging and guiding the user.
      Updates.reloadAsync(); 
    }
  };

  render() {
    if (this.state.hasError) {
      // Pass context through to the functional component if needed, 
      // but FallbackUI can use the hook directly.
      return <FallbackUI onReload={this.handleReload} error={this.state.error} />;
    }

    return this.props.children; 
  }
}

// Functional component to use hooks for styling the fallback UI
interface FallbackUIProps {
  onReload: () => void;
  error?: Error;
}

function FallbackUI({ onReload, error }: FallbackUIProps) {
  const { colors, theme, fontWeight } = useThemeStyles();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
      backgroundColor: colors.background.primary,
    },
    title: {
      fontSize: theme.fontSizes.heading,
      fontWeight: fontWeight('bold'),
      color: colors.ui.error,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    message: {
      fontSize: theme.fontSizes.body,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    errorDetails: {
      fontSize: theme.fontSizes.caption,
      color: colors.text.tertiary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', // Platform is now imported
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oops! Something went wrong.</Text>
      <Text style={styles.message}>
        An unexpected error occurred. Please try reloading the app.
      </Text>
      {/* Optionally show error details in development */} 
      {__DEV__ && error && (
        <Text style={styles.errorDetails}>
          Error: {error.message}
        </Text>
      )}
      {/* Use a standard Button for simplicity, or a ThemedButton */}
      <Button title="Reload App" onPress={onReload} color={colors.primary} />
    </View>
  );
} 