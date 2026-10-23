import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Pill,
  FileText,
  Bell,
  Sun,
  Moon,
  Smartphone,
  Globe,
  ShieldAlert,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/use-theme';
import { useTranslation } from '../../context/LocalizationContext';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { ThemeMode } from '../../context/ThemeContext';
import { LiquidBackground } from '../../components/LiquidBackground';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const { locale, setLocale, t } = useTranslation();

  const handleLogout = () => {
    Alert.alert(
      t('profile.signOutConfirmTitle'),
      t('profile.signOutConfirmMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.signOut'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: 'system',
      label: t('profile.themeSystem'),
      icon: (
        <Smartphone
          size={15}
          color={themeMode === 'system' ? '#FFFFFF' : colors.textSecondary}
        />
      ),
    },
    {
      mode: 'light',
      label: t('profile.themeLight'),
      icon: (
        <Sun
          size={15}
          color={themeMode === 'light' ? '#FFFFFF' : colors.textSecondary}
        />
      ),
    },
    {
      mode: 'dark',
      label: t('profile.themeDark'),
      icon: (
        <Moon
          size={15}
          color={themeMode === 'dark' ? '#FFFFFF' : colors.textSecondary}
        />
      ),
    },
  ];

  const languageOptions = [
    { code: 'en' as const, label: 'English' },
    { code: 'bn' as const, label: 'বাংলা' },
  ];

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <Header title={t('profile.title')} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* User Glass Card */}
          <Card style={styles.userCard} glow>
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: isDark
                    ? 'rgba(20, 184, 166, 0.2)'
                    : 'rgba(13, 148, 136, 0.12)',
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.avatarInitial, { color: colors.primary }]}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.name || 'MediMate User'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email || 'patient@medimate.com'}
              </Text>
              <View style={styles.badgeRow}>
                <Badge
                  label={user?.role === 'ADMIN' ? 'Doctor / Administrator' : 'Patient'}
                  variant={user?.role === 'ADMIN' ? 'blue' : 'teal'}
                  dot
                />
              </View>
            </View>
          </Card>

          {/* Admin Access Banner */}
          {isAdmin && (
            <TouchableOpacity
              style={[
                styles.adminBanner,
                {
                  backgroundColor: isDark
                    ? 'rgba(12, 42, 74, 0.7)'
                    : 'rgba(240, 249, 255, 0.75)',
                  borderColor: isDark ? '#0284C7' : '#BAE6FD',
                },
              ]}
              onPress={() => router.push('/admin')}
              activeOpacity={0.8}
            >
              <View style={styles.adminBannerLeft}>
                <View
                  style={[
                    styles.adminIconBox,
                    { backgroundColor: isDark ? '#0369A1' : '#E0F2FE' },
                  ]}
                >
                  <ShieldAlert size={22} color={isDark ? '#BAE6FD' : '#0284C7'} />
                </View>
                <View>
                  <Text
                    style={[
                      styles.adminBannerTitle,
                      { color: isDark ? '#E0F2FE' : '#0369A1' },
                    ]}
                  >
                    Medical Admin Dashboard
                  </Text>
                  <Text
                    style={[
                      styles.adminBannerSubtitle,
                      { color: isDark ? '#BAE6FD' : '#0284C7' },
                    ]}
                  >
                    View system metrics, users, and manage verified prices
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={isDark ? '#BAE6FD' : '#0284C7'} />
            </TouchableOpacity>
          )}

          {/* Section: Preferences (Dark Mode & Language) */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t('profile.preferences')}
          </Text>
          <Card style={styles.preferencesCard}>
            {/* Theme Switcher */}
            <View style={styles.preferenceBlock}>
              <View style={styles.prefHeaderRow}>
                <View
                  style={[
                    styles.prefIconBox,
                    {
                      backgroundColor: isDark
                        ? 'rgba(20, 184, 166, 0.2)'
                        : 'rgba(13, 148, 136, 0.12)',
                    },
                  ]}
                >
                  {isDark ? (
                    <Moon size={18} color={colors.primary} />
                  ) : (
                    <Sun size={18} color={colors.primary} />
                  )}
                </View>
                <View style={styles.prefTextContainer}>
                  <Text style={[styles.prefTitle, { color: colors.text }]}>
                    {t('profile.theme')}
                  </Text>
                  <Text style={[styles.prefSubtitle, { color: colors.textSecondary }]}>
                    {themeMode === 'system'
                      ? `${t('profile.themeSystem')} (${isDark ? t('profile.themeDark') : t('profile.themeLight')})`
                      : themeMode === 'dark'
                      ? t('profile.themeDark')
                      : t('profile.themeLight')}
                  </Text>
                </View>
              </View>

              {/* Segmented Control for Theme */}
              <View
                style={[
                  styles.segmentedContainer,
                  {
                    backgroundColor: colors.glassCardSubtle,
                    borderColor: colors.glassBorderSubtle,
                  },
                ]}
              >
                {themeOptions.map((opt) => {
                  const isActive = themeMode === opt.mode;
                  return (
                    <TouchableOpacity
                      key={opt.mode}
                      style={[
                        styles.segmentButton,
                        isActive && {
                          backgroundColor: colors.primary,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.15,
                          shadowRadius: 3,
                          elevation: 2,
                        },
                      ]}
                      onPress={() => setThemeMode(opt.mode)}
                      activeOpacity={0.7}
                    >
                      {opt.icon}
                      <Text
                        style={[
                          styles.segmentLabel,
                          {
                            color: isActive ? '#FFFFFF' : colors.textSecondary,
                            fontWeight: isActive ? '800' : '600',
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View
              style={[
                styles.divider,
                { backgroundColor: colors.glassBorderSubtle },
              ]}
            />

            {/* Language Switcher */}
            <View style={styles.preferenceBlock}>
              <View style={styles.prefHeaderRow}>
                <View
                  style={[
                    styles.prefIconBox,
                    {
                      backgroundColor: isDark
                        ? 'rgba(2, 132, 199, 0.2)'
                        : 'rgba(2, 132, 199, 0.12)',
                    },
                  ]}
                >
                  <Globe size={18} color={colors.secondary} />
                </View>
                <View style={styles.prefTextContainer}>
                  <Text style={[styles.prefTitle, { color: colors.text }]}>
                    {t('profile.language')}
                  </Text>
                  <Text style={[styles.prefSubtitle, { color: colors.textSecondary }]}>
                    {locale === 'bn' ? 'বাংলা (Bangla)' : 'English'}
                  </Text>
                </View>
              </View>

              {/* Segmented Control for Language */}
              <View
                style={[
                  styles.segmentedContainer,
                  {
                    backgroundColor: colors.glassCardSubtle,
                    borderColor: colors.glassBorderSubtle,
                  },
                ]}
              >
                {languageOptions.map((opt) => {
                  const isActive = locale === opt.code;
                  return (
                    <TouchableOpacity
                      key={opt.code}
                      style={[
                        styles.segmentButton,
                        isActive && {
                          backgroundColor: colors.primary,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.15,
                          shadowRadius: 3,
                          elevation: 2,
                        },
                      ]}
                      onPress={() => setLocale(opt.code)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.segmentLabel,
                          {
                            color: isActive ? '#FFFFFF' : colors.textSecondary,
                            fontWeight: isActive ? '800' : '600',
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Card>

          {/* Section: Features & Health Tools */}
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            {t('profile.appSettings')}
          </Text>
          <Card style={styles.menuCard}>
            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: colors.glassBorderSubtle },
              ]}
              onPress={() => router.push('/prescription/scan')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor: isDark
                      ? 'rgba(20, 184, 166, 0.2)'
                      : 'rgba(13, 148, 136, 0.12)',
                  },
                ]}
              >
                <FileText size={18} color={colors.primary} />
              </View>
              <Text style={[styles.menuTitle, { color: colors.text }]}>
                {t('scan.heading')}
              </Text>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: colors.glassBorderSubtle },
              ]}
              onPress={() => router.push('/(tabs)/medicines')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor: isDark
                      ? 'rgba(2, 132, 199, 0.2)'
                      : 'rgba(2, 132, 199, 0.12)',
                  },
                ]}
              >
                <Pill size={18} color={colors.secondary} />
              </View>
              <Text style={[styles.menuTitle, { color: colors.text }]}>
                {t('medicines.title')}
              </Text>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => router.push('/(tabs)/reminders')}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor: isDark
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(245, 158, 11, 0.12)',
                  },
                ]}
              >
                <Bell size={18} color={colors.warning} />
              </View>
              <Text style={[styles.menuTitle, { color: colors.text }]}>
                {t('reminders.title')}
              </Text>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>

          {/* Medical Disclaimer Banner */}
          <DisclaimerBanner />

          {/* Sign Out Button */}
          <Button
            title={t('profile.signOut')}
            variant="glass"
            size="lg"
            onPress={handleLogout}
            icon={<LogOut size={18} color={colors.primary} />}
            style={styles.logoutBtn}
          />

          <Text style={[styles.versionText, { color: colors.textMuted }]}>
            MediMate v1.0.0 • Liquid Glass Edition
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  adminBanner: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  adminBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  adminIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adminBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  adminBannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  preferencesCard: {
    padding: 16,
    marginBottom: 16,
  },
  preferenceBlock: {
    marginVertical: 4,
  },
  prefHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prefIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prefTextContainer: {
    flex: 1,
  },
  prefTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  prefSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    gap: 5,
  },
  segmentLabel: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  menuCard: {
    padding: 6,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  logoutBtn: {
    marginTop: 10,
    marginBottom: 16,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 6,
  },
});
