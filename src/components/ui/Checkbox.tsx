import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
}

export function Checkbox({ checked, onToggle, size = 24 }: CheckboxProps) {
  const { colors, borderRadius } = useTheme();

  return (
    <TouchableOpacity onPress={onToggle}>
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: borderRadius.sm,
            borderWidth: 2,
            borderColor: checked ? colors.primary : colors.border,
            backgroundColor: checked ? colors.primary : 'transparent',
          }
        ]}
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={size - 8}
            color={colors.text.inverse}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 