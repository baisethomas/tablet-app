# Styling Guide for Tablet Sermon App

## Overview

This project uses React Native's built-in styling system with a theme context to provide consistent styling across the app. This approach offers the benefits of:

1. Native React Native styling that works well with TypeScript
2. Theme-aware components that adapt to light/dark mode
3. Reusable style patterns
4. Proper type checking for styles

## Theme System

The app uses a central theme context (`ThemeContext`) that provides:

- Color palettes for light and dark modes
- Theme toggling functionality
- Access to the current theme mode

## Theme Hooks

### `useTheme()`

The primary hook for accessing theme information:

```tsx
import { useTheme } from '../contexts/theme-context';

function MyComponent() {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background.primary }}>
      <Text style={{ color: colors.text.primary }}>Themed text</Text>
      <Button onPress={toggleDarkMode} title="Toggle Theme" />
    </View>
  );
}
```

### `useThemeStyles()`

A utility hook for creating theme-aware stylesheets:

```tsx
import { useThemeStyles } from '../hooks/useThemeStyles';

function MyComponent() {
  const { createThemedStyles } = useThemeStyles();
  
  const styles = createThemedStyles((colors) => ({
    container: {
      backgroundColor: colors.background.primary,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    description: {
      fontSize: 16,
      color: colors.text.secondary,
    },
  }));
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Title</Text>
      <Text style={styles.description}>My description text</Text>
    </View>
  );
}
```

## Common Components

### `ThemedButton`

A themed button component with various states and variants:

```tsx
<ThemedButton
  label="Press Me"
  variant="primary" // 'primary' | 'secondary' | 'outline'
  size="medium" // 'small' | 'medium' | 'large'
  isLoading={false}
  isError={false}
  onPress={handlePress}
/>
```

## Theme Colors

The theme provides a consistent color palette across light and dark modes:

### Base Colors

- `primary`: Main brand color
- `secondary`: Secondary brand color

### Background Colors

- `background.primary`: Main background color
- `background.secondary`: Secondary background color (for cards, etc.)

### Text Colors

- `text.primary`: Main text color
- `text.secondary`: Secondary text color (for less emphasis)
- `text.tertiary`: Tertiary text color (for even less emphasis)

### UI Colors

- `ui.success`: For success states and messaging
- `ui.error`: For error states and messaging
- `ui.warning`: For warning states and messaging
- `ui.info`: For informational states and messaging
- `ui.disabled`: For disabled UI elements
- `ui.border`: For borders and dividers

## Best Practices

1. **Use Theme Hooks**: Always use `useTheme()` or `useThemeStyles()` hooks to create theme-aware components.

2. **Organize Styles**: Keep styles organized and separate from component logic:
   ```tsx
   function MyComponent() {
     const { createThemedStyles } = useThemeStyles();
     const styles = createThemedStyles(/* ... */);
     
     // Component logic
     
     return (
       // JSX with styles
     );
   }
   ```

3. **Use StyleSheet.compose**: For extending styles:
   ```tsx
   const baseStyle = { padding: 16 };
   const extendedStyle = StyleSheet.compose(baseStyle, { margin: 8 });
   ```

4. **Follow TypeScript Conventions**: Use proper types for style properties (e.g., fontWeight must be one of the predefined values like 'bold', '600', etc.).

5. **Reuse Common Styles**: Create shared style objects for common patterns.

## Migrating from NativeWind

Originally, we attempted to implement NativeWind for utility-first styling, but encountered integration issues with TypeScript and the project's setup. The current approach using React Native's built-in styling system provides better TypeScript support and integration with the existing theme system.

If you are interested in exploring NativeWind in the future, refer to the `/docs/nativewind-usage.md` file for installation and setup instructions. 