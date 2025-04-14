import { useThemeContext } from '../contexts/theme-context';
import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Theme } from '../types/theme';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function useTheme() {
  const { theme, isDarkMode, isLoading } = useThemeContext();

  function createThemedStyles<T extends NamedStyles<T>>(
    styleCreator: (colors: Theme['colors']) => T
  ): T {
    if (isLoading) {
      // Return empty styles during loading
      return {} as T;
    }

    return StyleSheet.create(styleCreator(theme.colors));
  }

  function getFontWeight(weight: keyof Theme['typography']['fontWeight']): string {
    return theme.typography.fontWeight[weight];
  }

  return {
    colors: theme.colors,
    spacing: theme.spacing,
    typography: theme.typography,
    borderRadius: theme.borderRadius,
    isDarkMode,
    isLoading,
    createThemedStyles,
    getFontWeight,
  };
} 