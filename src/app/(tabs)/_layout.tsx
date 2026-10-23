import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Home, FileText, Pill, Bell, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LocalizationContext';

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarBackground: () => (
          <BlurView
            intensity={isDark ? 65 : 50}
            tint={colors.blurTint}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomInset,
          left: 16,
          right: 16,
          height: 68,
          borderRadius: 28,
          backgroundColor: isDark
            ? 'rgba(11, 18, 32, 0.72)'
            : 'rgba(255, 255, 255, 0.75)',
          borderWidth: 1,
          borderTopWidth: 1.5,
          borderColor: colors.glassBorder,
          borderTopColor: colors.glassHighlight,
          shadowColor: isDark ? colors.glassGlow : colors.shadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.4 : 0.12,
          shadowRadius: 16,
          elevation: 6,
          paddingBottom: 8,
          paddingTop: 8,
          overflow: 'hidden',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Home size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: t('tabs.prescriptions'),
          tabBarIcon: ({ color, size }) => (
            <FileText size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="medicines"
        options={{
          title: t('tabs.medicines'),
          tabBarIcon: ({ color, size }) => (
            <Pill size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: t('tabs.reminders'),
          tabBarIcon: ({ color, size }) => (
            <Bell size={size || 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <User size={size || 22} color={color} />
          ),
        }}
      />
      </Tabs>
    </View>
  );
}
