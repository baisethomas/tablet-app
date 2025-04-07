interface ColorPalette {
  primary: string;
  secondary: string;
  background: {
    primary: string;
    secondary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  ui: {
    success: string;
    error: string;
    warning: string;
    info: string;
    disabled: string;
    border: string;
  };
}

interface ThemeColors {
  light: ColorPalette;
  dark: ColorPalette;
}

export const colors: ThemeColors = {
  light: {
    primary: '#4A6D8C', // calm blue
    secondary: '#8A9BA8', // muted blue-gray
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F7F9',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      tertiary: '#999999',
    },
    ui: {
      success: '#4A8C6A', // muted green
      error: '#B55A5A', // muted red
      warning: '#D9A55A', // earth tone amber
      info: '#5A7DB5', // calm blue
      disabled: '#CCCCCC',
      border: '#E0E0E0',
    },
  },
  dark: {
    primary: '#5D8CAD', // lighter calm blue for dark mode
    secondary: '#7D8A95', // lighter muted blue-gray for dark mode
    background: {
      primary: '#121212',
      secondary: '#1E1E1E',
    },
    text: {
      primary: '#F5F5F5',
      secondary: '#BBBBBB',
      tertiary: '#888888',
    },
    ui: {
      success: '#5D9E7D', // lighter muted green for dark mode
      error: '#C76D6D', // lighter muted red for dark mode
      warning: '#E5B56D', // lighter earth tone amber for dark mode
      info: '#6D8EC6', // lighter calm blue for dark mode
      disabled: '#555555',
      border: '#333333',
    },
  },
}; 