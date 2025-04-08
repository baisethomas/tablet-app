export const fontWeights = {
  thin: '100',
  extraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
  // Aliases for matching React Native's named weights
  normal: '400',
};

export const fontSizes = {
  caption: 12,
  button: 14,
  body: 16,
  title: 20,
  heading: 24,
  displaySmall: 30,
  displayMedium: 36,
  displayLarge: 42,
};

export const fonts = {
  main: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
};

export const lineHeights = {
  caption: 16,
  button: 20,
  body: 24,
  title: 28,
  heading: 32,
  displaySmall: 38,
  displayMedium: 44,
  displayLarge: 50,
};

// Export a type for the font weight keys for better type safety
export type FontWeightKeys = keyof typeof fontWeights; 