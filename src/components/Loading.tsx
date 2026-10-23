import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading MediMate...',
  fullScreen = false,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        fullScreen && [styles.fullScreen, { backgroundColor: colors.background }],
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        {message && (
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    minWidth: 200,
  },
  message: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
