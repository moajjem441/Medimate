import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  glow?: boolean;
  glowColor?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  intensity,
  glow = false,
  glowColor,
  noPadding = false,
  ...props
}) => {
  const { colors, isDark } = useTheme();

  const blurIntensity = intensity !== undefined ? intensity : (isDark ? 55 : 40);
  const activeGlow = glowColor || colors.glassGlow;

  return (
    <View
      style={[
        styles.outerContainer,
        {
          borderColor: colors.glassBorder,
          borderTopColor: colors.glassHighlight,
          shadowColor: glow ? activeGlow : colors.shadow,
          shadowOpacity: glow ? 0.35 : (isDark ? 0.4 : 0.08),
          shadowRadius: glow ? 16 : 10,
          elevation: glow ? 6 : 3,
        },
        style,
      ]}
      {...props}
    >
      <BlurView
        intensity={blurIntensity}
        tint={colors.blurTint}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.innerOverlay,
          {
            backgroundColor: colors.glassCard,
            padding: noPadding ? 0 : 16,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderTopWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
  },
  innerOverlay: {
    flex: 1,
  },
});
