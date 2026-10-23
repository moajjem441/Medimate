import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api, TOKEN_KEY, USER_KEY } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string;
  createdAt: string;
  _count?: {
    medicines: number;
    prescriptions: number;
    reminders: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveAuthData = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      }
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
    }
  };

  const clearAuthData = async () => {
    setToken(null);
    setUser(null);

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  };

  const loadStoredAuth = async () => {
    try {
      let storedToken: string | null = null;
      let storedUserStr: string | null = null;

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          storedToken = localStorage.getItem(TOKEN_KEY);
          storedUserStr = localStorage.getItem(USER_KEY);
        }
      } else {
        storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        storedUserStr = await SecureStore.getItemAsync(USER_KEY);
      }

      if (storedToken && storedUserStr) {
        setToken(storedToken);
        setUser(JSON.parse(storedUserStr));
        // Verify token in background
        try {
          const res = await api.get('/auth/me');
          if (res.data?.data) {
            setUser(res.data.data);
          }
        } catch (e: any) {
          // Only clear if the server explicitly confirmed the token is expired/invalid (401)
          // Do NOT clear on network disconnects or server restarts!
          if (e?.response?.status === 401) {
            await clearAuthData();
          } else {
            console.warn('Background profile verification skipped (network/offline):', e?.message);
          }
        }
      }
    } catch (err) {
      console.warn('Error restoring auth state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.data) {
      await saveAuthData(res.data.data.token, res.data.data.user);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.data) {
      await saveAuthData(res.data.data.token, res.data.data.user);
    }
  };

  const logout = async () => {
    await clearAuthData();
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data?.data) {
        setUser(res.data.data);
      }
    } catch (e) {
      console.warn('Failed to refresh user profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
