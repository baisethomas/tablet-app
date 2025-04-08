import React, { useMemo } from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { FontWeightKeys } from '../theme/typography';

interface ThemedTextProps extends TextProps {
  variant?: 'body' | 'caption' | 'button' | 'title' | 'heading' | 'displaySmall' | 'displayMedium' | 'displayLarge';
  weight?: FontWeightKeys;
  color?: string;
}

/**
 * A themed text component that uses our typography system
 */
export function ThemedText({
  children,
  variant = 'body',
  weight = 'regular',
  color,
  style,
  ...rest
}: ThemedTextProps) {
  const { colors, fontWeight, theme } = useThemeStyles();
  
  // Compute text style based on variant, weight, and color
  const textStyle = useMemo(() => {
    // Get font size from theme based on variant
    const fontSize = theme.fontSizes[variant];
    
    // Get line height from theme based on variant
    const lineHeight = theme.lineHeights[variant];
    
    // Create base style
    const baseStyle: TextStyle = {
      fontSize,
      lineHeight,
      fontWeight: fontWeight(weight),
      color: color || colors.text.primary,
    };
    
    return StyleSheet.create({
      text: baseStyle,
    });
  }, [variant, weight, color, theme, colors, fontWeight]);
  
  return (
    <Text style={[textStyle.text, style]} {...rest}>
      {children}
    </Text>
  );
}

/**
 * Examples:
 * 
 * <ThemedText>Default body text</ThemedText>
 * <ThemedText variant="heading" weight="bold">Bold Heading</ThemedText>
 * <ThemedText variant="caption" weight="medium" color={colors.text.secondary}>Medium caption</ThemedText>
 */ 