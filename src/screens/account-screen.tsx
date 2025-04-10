import React, { useState, useCallback } from 'react';
import {
  View, 
  Text, 
  Button, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  Switch,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/auth-context/auth-context';
import { useTheme } from '../contexts/theme-context';
import { clearAllSermons } from '../services/sermon-storage'; 

export function AccountScreen() {
  const { user, signOut } = useAuth();
  const { colors, isDarkMode, toggleDarkMode, theme } = useTheme(); // Get theme state/functions
  const styles = useStyles();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // Navigation back to Auth flow is handled by RootNavigator via AuthContext state change
    } catch (error: any) {
      console.error("[AccountScreen] Sign out failed:", error);
      Alert.alert("Error", error.message || "Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }, [signOut]);

  const clearLocalData = async () => {
    console.log('[AccountScreen] Clearing local data via SermonStorage...');
    await clearAllSermons(); 
  };

  const handleClearData = useCallback(async () => {
    Alert.alert(
      'Confirm Clear Data',
      'Are you sure you want to delete all locally stored sermon data? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            setIsClearingData(true);
            try {
              await clearLocalData();
              Alert.alert('Success', 'Local data cleared successfully.');
            } catch (error: any) {
              console.error("[AccountScreen] Clear data failed:", error);
              Alert.alert("Error", error.message || "Failed to clear local data.");
            } finally {
              setIsClearingData(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, []);

  // Handle potential null user state, though unlikely if routed correctly
  if (!user) {
    return (
      <View style={styles.scrollView}> 
        <Text style={styles.errorText}>User not found. Please sign in again.</Text>
         {/* Optionally add a button to force sign out / go back */}
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContentContainer}
    >
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.valueText}>{user.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.settingRow}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch
          trackColor={{ false: colors.ui.disabled, true: colors.primary }} // Use theme colors
          thumbColor={isDarkMode ? colors.background.secondary : colors.background.primary } // Adjust thumb color
          ios_backgroundColor={colors.ui.disabled}
          onValueChange={toggleDarkMode}
          value={isDarkMode}
        />
      </View>

      <Text style={styles.sectionTitle}>Data Management</Text>
      <View style={styles.buttonContainerSmall}>
        <Button 
          title={isClearingData ? "Clearing..." : "Clear Local Sermon Data"} 
          onPress={handleClearData} 
          color={colors.ui.warning} // Use warning color
          disabled={isClearingData}
        />
      </View>
      {isClearingData && <ActivityIndicator style={styles.smallLoader} size="small" color={colors.primary} />}

      {/* Sign Out Button at the bottom */}      
      <View style={styles.signOutButtonContainer}>
        {isSigningOut ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <Button 
            title="Sign Out" 
            onPress={handleSignOut} 
            color={colors.ui.error} 
            disabled={isSigningOut}
          />
        )}
      </View>
    </ScrollView>
  );
}

// Styles factory using the theme
const useStyles = () => {
  const { colors, theme } = useTheme();
  const { spacing, fontSizes, lineHeights } = theme;

  return StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContentContainer: {
      padding: spacing.lg,
      alignItems: 'center', 
      paddingBottom: spacing.xxl, // Ensure space at bottom
    },
    sectionTitle: {
      fontSize: fontSizes.heading,
      fontWeight: 'bold', // Use literal
      color: colors.text.primary,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
      alignSelf: 'flex-start',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.ui.border,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingVertical: spacing.md, // More padding for switch
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.ui.border,
    },
    label: {
      fontSize: fontSizes.body,
      fontWeight: '500', // Use literal
      color: colors.text.primary, // Use primary text for labels too
      // Remove margin top/bottom, handle spacing in row container
    },
    valueText: {
      fontSize: fontSizes.body,
      fontWeight: 'normal',
      color: colors.text.secondary, // Use secondary for values
      flexShrink: 1, // Allow text to wrap if needed
      textAlign: 'right',
    },
    buttonContainerSmall: {
      width: '100%',
      marginTop: spacing.md,
    },
    smallLoader: {
      marginTop: spacing.sm,
    },
    signOutButtonContainer: {
      marginTop: spacing.xxl, // More space above sign out
      width: '80%', 
      marginBottom: spacing.lg, // Consistent bottom margin
    },
    errorText: {
        color: colors.ui.error,
        fontSize: fontSizes.body,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
  });
}; 