import { useTheme } from '../contexts/theme-context';

/**
 * Hook for using themed NativeWind classes
 * @returns utility functions for using themed styles
 */
export function useThemedStyles() {
  const { isDarkMode, colors } = useTheme();
  
  /**
   * Returns the appropriate class based on current theme mode
   * @param lightClass - Class to use in light mode
   * @param darkClass - Class to use in dark mode
   * @returns The appropriate class for the current theme
   */
  const getThemeClass = (lightClass: string, darkClass: string) => {
    return isDarkMode ? darkClass : lightClass;
  };
  
  /**
   * Returns theme-aware color class for text
   * @param variant - 'primary' | 'secondary' | 'tertiary'
   * @returns Appropriate text color class
   */
  const getTextColorClass = (variant: 'primary' | 'secondary' | 'tertiary' = 'primary') => {
    return getThemeClass(
      `text-text-${variant}-light`, 
      `text-text-${variant}-dark`
    );
  };
  
  /**
   * Returns theme-aware color class for backgrounds
   * @param variant - 'primary' | 'secondary'
   * @returns Appropriate background color class
   */
  const getBackgroundColorClass = (variant: 'primary' | 'secondary' = 'primary') => {
    return getThemeClass(
      `bg-bg-${variant}-light`, 
      `bg-bg-${variant}-dark`
    );
  };
  
  /**
   * Returns theme-aware UI color class
   * @param type - 'success' | 'error' | 'warning' | 'info' | 'disabled' | 'border'
   * @param isBg - Whether to use as a background color (default: false)
   * @returns Appropriate UI color class
   */
  const getUIColorClass = (
    type: 'success' | 'error' | 'warning' | 'info' | 'disabled' | 'border',
    isBg = false
  ) => {
    const prefix = isBg ? 'bg' : 'text';
    return getThemeClass(
      `${prefix}-${type}-light`,
      `${prefix}-${type}-dark`
    );
  };
  
  return {
    getThemeClass,
    getTextColorClass,
    getBackgroundColorClass,
    getUIColorClass,
    isDarkMode,
    colors
  };
} 