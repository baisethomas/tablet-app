import React from 'react';
import { TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { useTheme } from '../../contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ThemeToggleProps {
  position?: 'top-right' | 'bottom-right';
}

export function ThemeToggle({ position = 'bottom-right' }: ThemeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    button: {
      position: 'absolute',
      backgroundColor: isDarkMode ? '#ffffff' : '#000000',
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      zIndex: 9, // Lower z-index to avoid conflicting with Expo notifications
      ...(position === 'top-right' 
        ? { 
            top: 20 + insets.top, 
            right: 20 + insets.right 
          } 
        : { 
            // Move up to avoid bottom tabs and Expo notifications
            bottom: 80 + insets.bottom, 
            right: 20 + insets.right 
          }),
    },
  });

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={toggleDarkMode}
      activeOpacity={0.8}
    >
      <Ionicons 
        name={isDarkMode ? 'sunny-outline' : 'moon-outline'} 
        size={24} 
        color={isDarkMode ? '#000000' : '#ffffff'} 
      />
    </TouchableOpacity>
  );
} 