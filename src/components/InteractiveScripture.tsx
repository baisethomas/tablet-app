import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { parseScriptureReferences } from '../services/scriptureParser';

interface InteractiveScriptureProps {
  text: string;
  onScripturePress: (reference: string) => void;
}

export function InteractiveScripture({ text, onScripturePress }: InteractiveScriptureProps) {
  const { colors, typography, spacing } = useTheme();

  useEffect(() => {
    // Test scripture parsing
    const testCases = [
      'John 3:16',
      'Romans 8:28-30',
      'Psalm 23:1-6',
      'Matthew 5:1-12',
      '1 Corinthians 13:4-7',
    ];

    testCases.forEach(reference => {
      const parsed = parseScriptureReferences(reference);
      console.log(`Testing "${reference}":`, parsed);
    });
  }, []);

  const renderText = () => {
    const parts = text.split(/(\d\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?)/g);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a scripture reference
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onScripturePress(part.trim())}
          >
            <Text style={[
              styles.scriptureReference,
              {
                color: colors.primary,
                fontSize: typography.fontSize.md,
                fontWeight: typography.fontWeight.medium,
              }
            ]}>
              {part}
            </Text>
          </TouchableOpacity>
        );
      }
      
      // Regular text
      return (
        <Text
          key={index}
          style={[
            styles.regularText,
            {
              color: colors.text.primary,
              fontSize: typography.fontSize.md,
              lineHeight: typography.fontSize.md * 1.5,
            }
          ]}
        >
          {part}
        </Text>
      );
    });
  };

  return (
    <View style={styles.container}>
      {renderText()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  regularText: {
    textAlign: 'left',
  },
  scriptureReference: {
    textDecorationLine: 'underline',
  },
}); 