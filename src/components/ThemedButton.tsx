import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/theme-context';

export interface ThemedButtonProps extends TouchableOpacityProps {
  /**
   * Button text
   */
  label: string;
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'outline';
  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether the button is in loading state
   */
  isLoading?: boolean;
  /**
   * Whether the button is in an error state
   */
  isError?: boolean;
}

/**
 * A themed button component using theme-aware styles
 */
export function ThemedButton({
  label,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  isError = false,
  disabled,
  style,
  ...props
}: ThemedButtonProps) {
  const { colors, isDarkMode } = useTheme();
  
  // Button container styles
  const variantStyles = {
    primary: {
      backgroundColor: isDarkMode ? colors.primary : colors.primary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: isDarkMode ? colors.secondary : colors.secondary,
      borderWidth: 0,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: isDarkMode ? colors.primary : colors.primary,
    },
  };
  
  // Size styles
  const sizeStyles = {
    small: {
      paddingVertical: 4,
      paddingHorizontal: 12,
    },
    medium: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    large: {
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
  };
  
  // Text styles
  const textStyles = {
    small: {
      fontSize: 14,
    },
    medium: {
      fontSize: 16,
    },
    large: {
      fontSize: 18,
    },
  };
  
  // Determine text color based on variant
  const textColor = variant === 'outline' 
    ? isDarkMode ? colors.primary : colors.primary
    : colors.text.primary;
  
  // Apply styles based on state
  const buttonStyle = [
    styles.button,
    variantStyles[variant],
    sizeStyles[size],
    disabled && { backgroundColor: isDarkMode ? colors.ui.disabled : colors.ui.disabled },
    isError && !disabled && { backgroundColor: isDarkMode ? colors.ui.error : colors.ui.error },
    style, // Apply any custom styles passed as props
  ];
  
  return (
    <TouchableOpacity
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      style={buttonStyle}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={textColor} style={styles.loader} />
      ) : null}
      <Text style={[styles.text, textStyles[size], { color: textColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '500',
  },
  loader: {
    marginRight: 8,
  },
}); 