# Typography Guide

This guide explains how to use the typography system in our app, with a focus on font weights.

## Font Weights

Our app uses a standardized font weight system defined in `src/theme/typography.ts`. 

### Available Font Weights

```typescript
fontWeights = {
  thin: '100',
  extraLight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
  normal: '400', // Alias for regular
}
```

### Using Font Weights in Components

We recommend using the `useThemeStyles` hook to apply font weights for consistent styling.

**IMPORTANT**: React hooks (including values returned from hooks) can only be used inside React component functions or other hooks. This means:

#### ✅ Correct: Define styles INSIDE component function

```tsx
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStyles } from '../hooks/useThemeStyles';

function MyComponent() {
  const { fontWeight, colors } = useThemeStyles();
  
  // Styles defined INSIDE component function can access hook values
  const styles = StyleSheet.create({
    heading: {
      fontSize: 24,
      fontWeight: fontWeight('bold'),
      color: colors.text.primary,
    },
    body: {
      fontSize: 16,
      fontWeight: fontWeight('regular'),
      color: colors.text.secondary,
    }
  });
  
  return (
    <View>
      <Text style={styles.heading}>Bold Heading</Text>
      <Text style={styles.body}>Regular body text</Text>
    </View>
  );
}
```

#### ❌ Incorrect: Styles outside component with hook values

```tsx
import { useThemeStyles } from '../hooks/useThemeStyles';

function MyComponent() {
  const { fontWeight } = useThemeStyles();
  // Component code...
}

// This will cause errors - hook values aren't available here!
const styles = StyleSheet.create({
  heading: {
    fontWeight: fontWeight('bold'), // ERROR: fontWeight not defined
  }
});
```

### Alternative: Use a Custom Style Hook

For larger components, you can create a dedicated style hook with memoization:

```tsx
function useMyComponentStyles() {
  const { fontWeight, colors } = useThemeStyles();
  
  return React.useMemo(() => StyleSheet.create({
    heading: {
      fontSize: 24,
      fontWeight: fontWeight('bold'),
      color: colors.text.primary,
    },
    body: {
      fontSize: 16,
      fontWeight: fontWeight('regular'),
      color: colors.text.secondary,
    }
  }), [fontWeight, colors]);
}

function MyComponent() {
  const styles = useMyComponentStyles();
  
  return (
    <View>
      <Text style={styles.heading}>Bold Heading</Text>
      <Text style={styles.body}>Regular body text</Text>
    </View>
  );
}
```

### Benefits of This Approach

1. **Consistency**: All font weights are defined in one place
2. **Type Safety**: TypeScript ensures you only use valid font weights
3. **Flexibility**: Easy to update all font weights app-wide
4. **Readability**: Semantic names like 'bold' and 'medium' are more readable than numeric values

## Best Practices

1. Always define styles that use hook values (like `fontWeight`) INSIDE component functions
2. For complex components, consider creating a dedicated style hook with useMemo
3. Prefer semantic names ('bold', 'medium') over numeric values ('700', '500')
4. Create reusable text components for common typography patterns 