import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.glassCard,
            borderColor: colors.glassBorder,
            borderTopColor: colors.glassHighlight,
          },
          isFocused && {
            borderColor: colors.borderFocus,
            borderTopColor: colors.borderFocus,
            backgroundColor: isDark
              ? 'rgba(20, 184, 166, 0.14)'
              : 'rgba(255, 255, 255, 0.92)',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 3,
          },
          !!error && {
            borderColor: colors.error,
            borderTopColor: colors.error,
            backgroundColor: colors.errorBg,
          },
        ]}
      >
        <BlurView
          intensity={isDark ? 40 : 25}
          tint={colors.blurTint}
          style={StyleSheet.absoluteFill}
        />

        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, { color: colors.text }, style]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            disabled={!onRightIconPress}
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: colors.textSecondary }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderTopWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 50,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  leftIconContainer: {
    marginRight: 10,
  },
  rightIconContainer: {
    marginLeft: 10,
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    marginTop: 5,
  },
});
