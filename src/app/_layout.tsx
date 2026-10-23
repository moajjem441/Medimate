import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { LocalizationProvider } from '../context/LocalizationContext';
import * as SystemUI from 'expo-system-ui';
import '../global.css';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigation() {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="prescription/scan"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="prescription/result"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="prescription/details"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="medicine/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="medicine/add"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="medicine/edit"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="reminder/add"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="reminder/edit"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="admin/index"
          options={{ headerShown: false }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Hide native splash once JS loads
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocalizationProvider>
          <AuthProvider>
            <RootNavigation />
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
