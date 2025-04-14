import React from 'react';
import { Text, TextStyle, Pressable } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ThemedTextProps {
  variant: 'primary' | 'secondary' | 'inverse';
  weight?: 'regular' | 'medium' | 'bold';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  children: React.ReactNode;
  style?: TextStyle;
  onPress?: () => void;
}

/**
 * A themed text component that uses our typography system
 */
export function ThemedText({ 
  variant, 
  weight = 'regular', 
  size = 'md', 
  children, 
  style,
  onPress
}: ThemedTextProps) {
  const { colors, typography, isLoading } = useTheme();

  if (isLoading) {
    return (
      <Text style={[{ color: '#000000' }, style]}>
        {children}
      </Text>
    );
  }

  const textStyle: TextStyle = {
    color: colors.text[variant],
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize[size],
    fontWeight: typography.fontWeight[weight],
  };

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        <Text style={[textStyle, style]}>
          {children}
        </Text>
      </Pressable>
    );
  }

  return (
    <Text style={[textStyle, style]}>
      {children}
    </Text>
  );
}

/**
 * Examples:
 * 
 * <ThemedText>Default body text</ThemedText>
 * <ThemedText variant="title" weight="bold">Bold Title</ThemedText>
 * <ThemedText variant="secondary" weight="medium">Medium secondary text</ThemedText>
 */ 