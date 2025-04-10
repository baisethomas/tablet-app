import React from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/auth-context/auth-context';
import { useTheme } from '../../contexts/theme-context';
import { FontWeightKeys } from '../../theme/typography';

// Basic navigation prop type
type NavigationProp = {
  goBack: () => void;
};

export function SignUpScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { signUp } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const styles = useStyles();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await signUp(email, password);
      // On successful sign-up, Firebase automatically signs the user in.
      // The onAuthStateChanged listener in AuthContext will handle the state update,
      // and RootNavigator will automatically navigate to the main app.
      Alert.alert("Success", "Account created successfully!");
      // Optionally navigate back or let RootNavigator handle it.
      // navigation.goBack(); 
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor={styles.placeholderColor}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Button title={isSubmitting ? "Creating Account..." : "Sign Up"} onPress={handleSignUp} disabled={isSubmitting} />
      <Button title="Already have an account? Sign In" onPress={() => navigation.goBack()} />
    </View>
  );
}

// useStyles factory function
const useStyles = () => {
  const { colors, theme } = useTheme();
  const { spacing, fontSizes, lineHeights } = theme;
  const placeholderColor = colors.text.secondary;

  return {
    ...StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        padding: spacing.lg,
        backgroundColor: colors.background.primary,
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
        borderColor: colors.ui.border,
        borderWidth: 1,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
        color: colors.text.primary,
        backgroundColor: colors.background.secondary,
        borderRadius: spacing.sm,
      },
      errorText: {
        color: colors.ui.error,
        marginBottom: spacing.md,
        textAlign: 'center',
      },
    }),
    placeholderColor: placeholderColor,
  };
}; 