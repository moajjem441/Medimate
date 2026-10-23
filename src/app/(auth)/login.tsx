import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, Stethoscope, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/use-theme';
import { useTranslation } from '../../context/LocalizationContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LiquidBackground } from '../../components/LiquidBackground';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(t('common.required'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email.trim(), password.trim());
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setEmail('user@medimate.com');
    setPassword('UserPassword123!');
    setError(null);
  };

  const fillDemoAdmin = () => {
    setEmail('admin@medimate.com');
    setPassword('AdminPassword123!');
    setError(null);
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Branding */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[
                styles.logoBadge,
                {
                  backgroundColor: isDark
                    ? 'rgba(20, 184, 166, 0.2)'
                    : 'rgba(13, 148, 136, 0.12)',
                  borderColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ]}
              onPress={() => router.replace('/')}
              activeOpacity={0.8}
            >
              <Stethoscope size={28} color={colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('auth.welcomeBack')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('auth.welcomeSubtitle')}
            </Text>
          </View>

          {/* Error Notification */}
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form Frosted Card */}
          <Card style={styles.formCard} glow>
            <Input
              label={t('auth.emailLabel')}
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={colors.textMuted} />}
            />

            <Input
              label={t('auth.passwordLabel')}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError(null);
              }}
              secureTextEntry
              leftIcon={<Lock size={18} color={colors.textMuted} />}
            />

            <View style={styles.forgotPasswordRow}>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  {t('auth.forgotPassword')}
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title={t('auth.signIn')}
              size="lg"
              loading={loading}
              onPress={handleLogin}
              iconRight={<ArrowRight size={18} color="#FFFFFF" />}
              style={styles.submitBtn}
            />
          </Card>

          {/* Quick Demo Credentials Helpers */}
          <View style={styles.demoSection}>
            <Text style={[styles.demoSectionTitle, { color: colors.textMuted }]}>
              Quick Demo Logins
            </Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.demoPill,
                  {
                    backgroundColor: colors.glassCardSubtle,
                    borderColor: colors.glassBorderSubtle,
                  },
                ]}
                onPress={fillDemoUser}
                activeOpacity={0.7}
              >
                <Text style={[styles.demoPillText, { color: colors.text }]}>
                  👤 Patient
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.demoPill,
                  {
                    backgroundColor: colors.glassCardSubtle,
                    borderColor: colors.glassBorderSubtle,
                  },
                ]}
                onPress={fillDemoAdmin}
                activeOpacity={0.7}
              >
                <Text style={[styles.demoPillText, { color: colors.text }]}>
                  🩺 Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Link */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {t('auth.dontHaveAccount')}{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                {t('auth.createAccount')}
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 290,
  },
  errorBox: {
    backgroundColor: 'rgba(254, 242, 242, 0.85)',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  formCard: {
    padding: 20,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    width: '100%',
  },
  demoSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  demoSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
  },
  demoPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
  },
});
