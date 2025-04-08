# Component Examples

## ThemedText Component

The `ThemedText` component demonstrates the proper way to use our typography system. It encapsulates the font weight, size, and color logic in a reusable component.

### Basic Usage

```tsx
import { ThemedText } from '../components/ThemedText';

function MyScreen() {
  return (
    <View>
      {/* Default body text with regular weight */}
      <ThemedText>Default body text</ThemedText>
      
      {/* Heading with bold weight */}
      <ThemedText variant="heading" weight="bold">
        Bold Heading
      </ThemedText>
      
      {/* Caption with medium weight and secondary color */}
      <ThemedText 
        variant="caption" 
        weight="medium" 
        color={colors.text.secondary}
      >
        Medium caption text
      </ThemedText>
      
      {/* Custom styling can be applied on top */}
      <ThemedText 
        variant="title" 
        weight="semiBold"
        style={{ marginVertical: 16, textAlign: 'center' }}
      >
        Custom styled title
      </ThemedText>
    </View>
  );
}
```

### WithThemedStyles Pattern

For components that need more complex styling with typography, use the pattern demonstrated in home-screen.tsx:

```tsx
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { useThemeStyles } from '../hooks/useThemeStyles';

function MyComponent() {
  // Get theme hooks inside component
  const { colors, fontWeight } = useThemeStyles();
  
  // Define styles inside component function
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.primary,
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.ui.border,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 4,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: fontWeight('medium'),
    }
  });
  
  return (
    <View style={styles.container}>
      <ThemedText variant="title" weight="semiBold">
        Component Title
      </ThemedText>
      
      <TouchableOpacity style={styles.button}>
        <ThemedText style={styles.buttonText}>
          Button Text
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}
```

## Typography Scale Reference

| Variant | Font Size | Line Height | Use Case |
|---------|-----------|------------|----------|
| caption | 12px | 16px | Small text, footnotes, labels |
| button | 14px | 20px | Button text, small UI elements |
| body | 16px | 24px | Main body text, paragraphs |
| title | 20px | 28px | Section titles, card titles |
| heading | 24px | 32px | Page/screen headings |
| displaySmall | 30px | 38px | Smaller display text |
| displayMedium | 36px | 44px | Medium display text |
| displayLarge | 42px | 50px | Large display text, hero sections | 