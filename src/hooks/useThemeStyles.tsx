import { useTheme } from '../contexts/theme-context';
import { StyleSheet, TextStyle } from 'react-native';
import { ColorPalette } from '../types/theme';
import { fontWeights, FontWeightKeys, fontSizes } from '../theme/typography';

// Valid React Native font weights
type RNFontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

/**
 * Helper function to use theme font weights
 * @param weightKey Key from the theme's fontWeights or a valid React Native font weight
 * @returns A valid font weight for React Native TextStyle
 */
export const getFontWeight = (weightKey: FontWeightKeys | RNFontWeight): RNFontWeight => {
  // If it's a key in our fontWeights object, return the mapped value
  if (typeof weightKey === 'string' && Object.keys(fontWeights).includes(weightKey)) {
    const value = fontWeights[weightKey as FontWeightKeys];
    return value as RNFontWeight;
  }
  // Otherwise, return the weightKey itself (assuming it's already a valid RN font weight)
  return weightKey as RNFontWeight;
};

/**
 * Hook for using theme-aware styles in React Native
 * @returns utility functions for creating styled components
 */
export function useThemeStyles() {
  const { isDarkMode, colors, theme } = useTheme();
  
  /**
   * Creates theme-aware styles
   * @param getStyles Function to generate styles based on theme colors
   * @returns StyleSheet styles for the current theme
   */
  const createThemedStyles = <T extends Record<string, any>>(
    getStyles: (colors: ColorPalette) => T
  ): T => {
    return StyleSheet.create(getStyles(colors));
  };
  
  return {
    createThemedStyles,
    isDarkMode,
    colors,
    theme,
    fontWeight: getFontWeight,
    fontSize: fontSizes
  };
} 