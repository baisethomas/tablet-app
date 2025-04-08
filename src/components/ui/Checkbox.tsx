import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useThemeStyles } from '../../hooks/useThemeStyles';

interface CheckboxProps {
  initialValue?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function Checkbox({ initialValue = false, onChange }: CheckboxProps) {
  const [checked, setChecked] = useState(initialValue);
  const { colors } = useThemeStyles();
  
  const styles = StyleSheet.create({
    container: {
      width: 24,
      height: 24,
      borderWidth: 1,
      borderColor: colors.ui.border,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: checked ? colors.primary : 'transparent',
    },
    checkmark: {
      width: 12,
      height: 6,
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      borderColor: 'white',
      transform: [{ rotate: '-45deg' }],
      marginTop: -2,
    }
  });
  
  const handlePress = () => {
    const newValue = !checked;
    setChecked(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {checked && <View style={styles.checkmark} />}
    </TouchableOpacity>
  );
} 