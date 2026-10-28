import React from 'react';
import {
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { AnimatedPressable } from './AnimatedPressable';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  style,
}) => {
  const { colors, isDark } = useTheme();

  const getPadding = () => {
    if (size === 'sm') return { paddingVertical: 8, paddingHorizontal: 16 };
    if (size === 'lg') return { paddingVertical: 15, paddingHorizontal: 28 };
    return { paddingVertical: 12, paddingHorizontal: 22 };
  };

  const getFontSize = () => {
    if (size === 'sm') return 13;
    if (size === 'lg') return 16;
    return 15;
  };

  const isPrimary = variant === 'primary';
  const isGlass = variant === 'glass';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';

  const getTextColor = (): string => {
    if (disabled) return colors.textMuted;
    if (isPrimary || isDanger) return '#FFFFFF';
    if (isGlass) return colors.text;
    if (isSecondary) return isDark ? '#38BDF8' : '#0369A1';
    if (isOutline || isGhost) return colors.primary;
    return colors.text;
  };
  

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled || loading}
      scaleTo={disabled ? 1 : 0.96}
      style={[
        styles.baseButton,
        getPadding(),
        isOutline && {
          borderWidth: 1.5,
          borderColor: disabled ? colors.border : colors.primary,
          backgroundColor: isDark ? 'rgba(13, 148, 136, 0.08)' : 'rgba(13, 148, 136, 0.04)',
        },
        isSecondary && {
          backgroundColor: isDark ? 'rgba(2, 132, 199, 0.16)' : 'rgba(2, 132, 199, 0.10)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.2)',
        },
        isDanger && {
          backgroundColor: disabled ? '#94A3B8' : colors.error,
        },
        isGlass && {
          borderWidth: 1,
          borderColor: colors.glassBorder,
          borderTopColor: colors.glassHighlight,
          backgroundColor: colors.glassCard,
        },
        style,
      ]}
    >
      {/* Primary Gradient Pill Background */}
      {isPrimary && !disabled && (
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}


      {/* Disabled Primary Background */}
      {isPrimary && disabled && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isDark ? '#334155' : '#CBD5E1' },
          ]}
        />
      )}

      {/* Frosted Blur for Glass Variant */}
      {isGlass && (
        <BlurView
          intensity={isDark ? 40 : 30}
          tint={colors.blurTint}
          style={StyleSheet.absoluteFill}
        />
      )}

      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary || isDanger ? '#FFFFFF' : colors.primary}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.leftIcon}>{icon}</View>}
          <Text
            style={[
              styles.baseText,
              {
                fontSize: getFontSize(),
                color: getTextColor(),
              },
            ]}
          >
            {title}
          </Text>
          {iconRight && <View style={styles.rightIcon}>{iconRight}</View>}
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
