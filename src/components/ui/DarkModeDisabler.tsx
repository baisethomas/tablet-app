import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/theme-context';

/**
 * This component is a development utility that forces light mode
 * It should be imported and used temporarily during development
 * when you need to ensure the app is in light mode
 */
export function DarkModeDisabler() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  // Force light mode on mount
  useEffect(() => {
    if (isDarkMode) {
      toggleDarkMode();
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // This component doesn't render anything
  return null;
} 