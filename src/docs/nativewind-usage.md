# NativeWind Implementation Notes

## Overview

We initially explored implementing NativeWind (Tailwind CSS for React Native) for styling components. However, we encountered several integration challenges with TypeScript and our project setup. This document preserves the research and approach for future reference.

## Implementation Challenges

1. **TypeScript Integration**: The `className` prop was not properly recognized by TypeScript for React Native components.
2. **Styled API Compatibility**: The styled API approach from NativeWind had conflicts with our dependencies.
3. **Build Configuration**: There were challenges with the Babel plugin integration.

## Alternative Approach

Instead of using NativeWind, we implemented a theme-aware styling approach using:
- React Native's built-in `StyleSheet` API
- A custom `useThemeStyles` hook
- The existing theme context

For current styling guidance, please refer to `styling-guide.md`.

## NativeWind Setup (For Reference)

If you wish to try NativeWind in the future, here are the steps:

### Installation

```bash
npm install nativewind
npx expo install react-native-svg
```

### Configuration Files

#### tailwind.config.js
```js
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Theme colors would go here
      },
    },
  },
  plugins: [],
}
```

#### babel.config.js
```js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'nativewind/babel',
  ],
};
```

#### app.d.ts
```typescript
/// <reference types="nativewind/types" />
```

### Styled API Approach

```tsx
import { styled } from 'nativewind';
import { Text, View } from 'react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

function MyComponent() {
  return (
    <StyledView className="bg-white p-4">
      <StyledText className="text-black text-lg">Hello World</StyledText>
    </StyledView>
  );
}
```

## Resources

- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) 