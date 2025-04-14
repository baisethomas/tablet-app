import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, FontWeight } from '../types/theme';

// Default theme values
const defaultTheme: Theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: {
      primary: '#FFFFFF',
      secondary: '#F2F2F7',
    },
    text: {
      primary: '#000000',
      secondary: '#8E8E93',
      inverse: '#FFFFFF',
    },
    border: '#C7C7CC',
    error: '#FF3B30',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontFamily: 'System',
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  isLoading: boolean;
  getFontWeight: (weight: keyof Theme['typography']['fontWeight']) => FontWeight;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  isDarkMode: false,
  isLoading: true,
  getFontWeight: () => '400',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Here you could load custom theme settings from storage
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing theme:', error);
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  const getFontWeight = (weight: keyof Theme['typography']['fontWeight']): FontWeight => {
    return theme.typography.fontWeight[weight];
  };

  const value = {
    theme,
    isDarkMode: colorScheme === 'dark',
    isLoading,
    getFontWeight,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
} 