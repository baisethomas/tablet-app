import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { parseScriptureReferences } from '../services/scriptureParser';

interface InteractiveScriptureProps {
  text: string;
  onScripturePress: (reference: string) => void;
}

export function InteractiveScripture({ text, onScripturePress }: InteractiveScriptureProps) {
  const { colors } = useTheme();

  if (!text) {
    return null;
  }

  // Improved regex to better match common scripture reference formats
  const scriptureRegex = /\b(?:(?:[1-3]\s*)?[A-Za-z]+\.?\s*\d+:\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*)\b/g;

  const renderText = () => {
    // Use our regex to find all possible scripture references
    const parts = text.split(scriptureRegex);
    const matches = text.match(scriptureRegex) || [];
    
    let result: React.ReactNode[] = [];
    let matchIndex = 0;
    
    for (let i = 0; i < parts.length; i++) {
      // Add the non-scripture text
      if (parts[i]) {
        result.push(
          <Text key={`text-${i}`} style={[styles.regularText, { color: colors.text.primary }]}>
            {parts[i]}
          </Text>
        );
      }
      
      // Add the scripture reference if we have a match
      if (matchIndex < matches.length && i < parts.length - 1) {
        const reference = matches[matchIndex];
        matchIndex++;
        
        result.push(
          <Pressable
            key={`scripture-${i}`}
            onPress={() => onScripturePress(reference)}
            style={({ pressed }) => [
              styles.scriptureReference,
              {
                backgroundColor: pressed ? colors.background.secondary : 'transparent',
                borderColor: colors.primary
              }
            ]}
          >
            <Text style={[styles.scriptureText, { color: colors.primary }]}>
              {reference}
            </Text>
          </Pressable>
        );
      }
    }
    
    return result;
  };

  return (
    <View style={styles.container}>
      {renderText()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scriptureReference: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    marginHorizontal: 2,
  },
  scriptureText: {
    fontSize: 16,
    fontWeight: '500',
  },
  regularText: {
    fontSize: 16,
    fontWeight: 'normal',
  },
}); 