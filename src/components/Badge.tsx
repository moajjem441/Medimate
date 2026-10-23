import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface BadgeProps {
  label: string;
  variant?: 'teal' | 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'neon';
  icon?: React.ReactNode;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'teal',
  icon,
  dot = false,
}) => {
  const { isDark } = useTheme();

  const getColors = () => {
    if (isDark) {
      switch (variant) {
        case 'teal':
          return {
            bg: 'rgba(20, 184, 166, 0.16)',
            border: 'rgba(45, 212, 191, 0.35)',
            text: '#2DD4BF',
            dot: '#2DD4BF',
          };
        case 'blue':
          return {
            bg: 'rgba(2, 132, 199, 0.16)',
            border: 'rgba(56, 189, 248, 0.35)',
            text: '#38BDF8',
            dot: '#38BDF8',
          };
        case 'green':
          return {
            bg: 'rgba(16, 185, 129, 0.16)',
            border: 'rgba(52, 211, 153, 0.35)',
            text: '#34D399',
            dot: '#34D399',
          };
        case 'amber':
          return {
            bg: 'rgba(245, 158, 11, 0.16)',
            border: 'rgba(251, 191, 36, 0.35)',
            text: '#FBBF24',
            dot: '#FBBF24',
          };
        case 'red':
          return {
            bg: 'rgba(239, 68, 68, 0.16)',
            border: 'rgba(248, 113, 113, 0.35)',
            text: '#F87171',
            dot: '#F87171',
          };
        case 'neon':
          return {
            bg: 'rgba(0, 242, 254, 0.18)',
            border: 'rgba(0, 242, 254, 0.45)',
            text: '#00F2FE',
            dot: '#00F2FE',
          };
        case 'slate':
        default:
          return {
            bg: 'rgba(51, 65, 85, 0.30)',
            border: 'rgba(148, 163, 184, 0.25)',
            text: '#CBD5E1',
            dot: '#94A3B8',
          };
      }
    }

    switch (variant) {
      case 'teal':
        return {
          bg: 'rgba(13, 148, 136, 0.10)',
          border: 'rgba(13, 148, 136, 0.25)',
          text: '#0F766E',
          dot: '#0D9488',
        };
      case 'blue':
        return {
          bg: 'rgba(2, 132, 199, 0.10)',
          border: 'rgba(2, 132, 199, 0.25)',
          text: '#0369A1',
          dot: '#0284C7',
        };
      case 'green':
        return {
          bg: 'rgba(16, 185, 129, 0.10)',
          border: 'rgba(16, 185, 129, 0.25)',
          text: '#15803D',
          dot: '#10B981',
        };
      case 'amber':
        return {
          bg: 'rgba(245, 158, 11, 0.10)',
          border: 'rgba(245, 158, 11, 0.25)',
          text: '#B45309',
          dot: '#F59E0B',
        };
      case 'red':
        return {
          bg: 'rgba(239, 68, 68, 0.10)',
          border: 'rgba(239, 68, 68, 0.25)',
          text: '#B91C1C',
          dot: '#EF4444',
        };
      case 'neon':
        return {
          bg: 'rgba(14, 165, 233, 0.12)',
          border: 'rgba(14, 165, 233, 0.3)',
          text: '#0284C7',
          dot: '#0284C7',
        };
      case 'slate':
      default:
        return {
          bg: 'rgba(241, 245, 249, 0.65)',
          border: 'rgba(203, 213, 225, 0.5)',
          text: '#475569',
          dot: '#64748B',
        };
    }
  };

  const scheme = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: scheme.bg,
          borderColor: scheme.border,
        },
      ]}
    >
      {dot && (
        <View style={[styles.dotIndicator, { backgroundColor: scheme.dot }]} />
      )}
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.text, { color: scheme.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
