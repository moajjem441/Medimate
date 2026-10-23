import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';
import bn from '../locales/bn.json';

export type AppLocale = 'en' | 'bn';

interface LocalizationContextType {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => Promise<void>;
  t: (key: string, options?: any) => string;
}

const LOCALE_STORAGE_KEY = '@medimate_locale';

const i18n = new I18n({ en, bn });
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState<AppLocale>('en');

  useEffect(() => {
    const initLocale = async () => {
      try {
        const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
        if (stored === 'en' || stored === 'bn') {
          i18n.locale = stored;
          setLocaleState(stored);
        } else {
          // Detect device language
          const deviceLocales = Localization.getLocales();
          const deviceLanguage = deviceLocales && deviceLocales[0] ? deviceLocales[0].languageCode : 'en';
          const defaultLang: AppLocale = deviceLanguage === 'bn' ? 'bn' : 'en';
          i18n.locale = defaultLang;
          setLocaleState(defaultLang);
        }
      } catch (err) {
        console.warn('Failed to load stored locale:', err);
      }
    };

    initLocale();
  }, []);

  const setLocale = async (newLocale: AppLocale) => {
    i18n.locale = newLocale;
    setLocaleState(newLocale);
    try {
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch (err) {
      console.warn('Failed to persist locale choice:', err);
    }
  };

  const t = useMemo(() => {
    return (key: string, options?: any): string => {
      return i18n.t(key, options);
    };
  }, [locale]);

  return (
    <LocalizationContext.Provider
      value={{
        locale,
        setLocale,
        t,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useTranslation = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LocalizationProvider');
  }
  return context;
};
