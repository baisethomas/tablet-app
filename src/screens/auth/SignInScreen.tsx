import React from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // For navigating to SignUp
import { useAuth } from '../../contexts/auth-context/auth-context';
import { useTheme } from '../../contexts/theme-context';
import { FontWeightKeys } from '../../theme/typography'; // Import the type

// Basic navigation prop type - adjust if using typed navigation
type NavigationProp = {
  navigate: (screen: string) => void;
};

export function SignInScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { signIn } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const styles = useStyles();

  const handleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      // Navigation to the main app will happen automatically via RootNavigator
      // due to the auth state change.
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={styles.placeholderColor}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={styles.placeholderColor}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Button title={isSubmitting ? "Signing In..." : "Sign In"} onPress={handleSignIn} disabled={isSubmitting} />
      <Button title="Don't have an account? Sign Up" onPress={() => navigation.navigate('SignUp')} />
    </View>
  );
}

// useStyles factory function
const useStyles = () => {
  const { colors, theme } = useTheme(); // Get active colors and full theme
  const { spacing, fontSizes, fontWeights, lineHeights } = theme; // Destructure specific parts

  // Extract placeholder color for direct use
  const placeholderColor = colors.text.secondary;

  return {
    ...StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.lg,
        backgroundColor: colors.background.primary, // Correct usage
      },
      title: {
        fontSize: fontSizes.heading,
        fontWeight: 'bold',
        lineHeight: lineHeights.heading,
        color: colors.text.primary,
        marginBottom: spacing.lg,
        textAlign: 'center',
      },
      input: {
        height: 40,
        borderColor: colors.ui.border, // Correct usage
        borderWidth: 1,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
        color: colors.text.primary, // Correct usage
        backgroundColor: colors.background.secondary, // Use secondary background for input
        borderRadius: spacing.sm,
      },
      errorText: {
        color: colors.ui.error, // Correct usage
        marginBottom: spacing.md,
        textAlign: 'center',
      },
    }),
    // Expose placeholder color separately for the component
    placeholderColor: placeholderColor,
  };
};