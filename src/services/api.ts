import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

/**
 * Dynamically resolves the API base URL:
 * 1. Explicit EXPO_PUBLIC_API_URL environment variable (from .env)
 * 2. Dynamic host IP from Expo Go bundler (matches the PC's Wi-Fi LAN IP automatically)
 * 3. Android Emulator fallback (10.0.2.2)
 * 4. Localhost fallback (Web / Desktop)
 */
const getBaseUrl = (): string => {
  // 1. Check explicit EXPO_PUBLIC_API_URL
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl && envApiUrl.trim() !== '') {
    return envApiUrl.trim();
  }

  // 2. Automatically detect development machine IP from Expo Go connection
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:5000/api`;
    }
  }

  // 3. Android emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  // 4. Default localhost for web or desktop
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseUrl();
export const SERVER_HOST = API_BASE_URL.replace('/api', '');

if (__DEV__) {
  console.log(`[MediMate API] Base URL configured: ${API_BASE_URL}`);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// SecureStore token keys
export const TOKEN_KEY = 'medimate_auth_token';
export const USER_KEY = 'medimate_auth_user';

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      let token: string | null = null;
      if (Platform.OS === 'web') {
        token =
          typeof window !== 'undefined'
            ? localStorage.getItem(TOKEN_KEY)
            : null;
      } else {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      }

      if (token && config.headers) {
        if (typeof (config.headers as any).set === 'function') {
          (config.headers as any).set('Authorization', `Bearer ${token}`);
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      if (__DEV__) {
        console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`);
      }
    } catch (err) {
      console.warn('Failed to retrieve token from storage', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clear error handling and logging
api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API RESPONSE] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (__DEV__) {
      console.warn(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Friendly, descriptive message if server cannot be reached
    if (error.message === 'Network Error' || !error.response) {
      return Promise.reject(
        new Error(
          `Cannot connect to server at ${API_BASE_URL}. Please ensure your phone and computer are on the same Wi-Fi network.`
        )
      );
    }

    // Backend-provided error message (e.g. 400 validation, 401 invalid credentials)
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected server error occurred.';

    return Promise.reject(new Error(message));
  }
);
