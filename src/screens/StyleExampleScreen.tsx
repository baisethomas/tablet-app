import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedButton } from '../components/ThemedButton';
import { useTheme } from '../contexts/theme-context';
import { useThemeStyles } from '../hooks/useThemeStyles';

/**
 * Screen to demonstrate theme styling
 */
export function StyleExampleScreen() {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const { createThemedStyles, fontWeight } = useThemeStyles();
  
  // Create theme-aware styles
  const styles = createThemedStyles((colors) => ({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: fontWeight('bold'),
      marginBottom: 8,
      color: colors.text.primary,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: fontWeight('600'),
      marginBottom: 8,
      color: colors.text.primary,
    },
    description: {
      fontSize: 16,
      color: colors.text.secondary,
      marginBottom: 16,
    },
    sampleGroup: {
      marginTop: 16,
      gap: 16,
    },
    colorSample: {
      padding: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    colorText: {
      color: '#FFFFFF',
      fontWeight: fontWeight('500'),
    },
  }));
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>
            Theme Style Examples
          </Text>
          <Text style={styles.description}>
            This screen demonstrates theme-aware styling
          </Text>
        </View>
        
        {/* Theme toggle */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>
            Theme Toggle
          </Text>
          <ThemedButton
            label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onPress={toggleDarkMode}
          />
        </View>
        
        {/* Button variants */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>
            Button Variants
          </Text>
          <View style={styles.sampleGroup}>
            <ThemedButton label="Primary Button" variant="primary" />
            <ThemedButton label="Secondary Button" variant="secondary" />
            <ThemedButton label="Outline Button" variant="outline" />
          </View>
        </View>
        
        {/* Button sizes */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>
            Button Sizes
          </Text>
          <View style={styles.sampleGroup}>
            <ThemedButton label="Small Button" size="small" />
            <ThemedButton label="Medium Button" size="medium" />
            <ThemedButton label="Large Button" size="large" />
          </View>
        </View>
        
        {/* Button states */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>
            Button States
          </Text>
          <View style={styles.sampleGroup}>
            <ThemedButton label="Normal Button" />
            <ThemedButton label="Loading Button" isLoading />
            <ThemedButton label="Disabled Button" disabled />
            <ThemedButton label="Error Button" isError />
          </View>
        </View>
        
        {/* Color showcase */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>
            Theme Colors
          </Text>
          <View style={styles.sampleGroup}>
            <View style={[styles.colorSample, { backgroundColor: colors.primary }]}>
              <Text style={styles.colorText}>Primary Color</Text>
            </View>
            <View style={[styles.colorSample, { backgroundColor: colors.secondary }]}>
              <Text style={styles.colorText}>Secondary Color</Text>
            </View>
            <View style={[styles.colorSample, { backgroundColor: colors.ui.success }]}>
              <Text style={styles.colorText}>Success Color</Text>
            </View>
            <View style={[styles.colorSample, { backgroundColor: colors.ui.error }]}>
              <Text style={styles.colorText}>Error Color</Text>
            </View>
            <View style={[styles.colorSample, { backgroundColor: colors.ui.warning }]}>
              <Text style={styles.colorText}>Warning Color</Text>
            </View>
            <View style={[styles.colorSample, { backgroundColor: colors.ui.info }]}>
              <Text style={styles.colorText}>Info Color</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 