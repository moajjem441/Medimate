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
import { Mail, Lock, User, Stethoscope, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/use-theme';
import { useTranslation } from '../../context/LocalizationContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { LiquidBackground } from '../../components/LiquidBackground';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError(t('common.required'));
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register(name.trim(), email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
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
              {t('auth.registerTitle')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('auth.registerSubtitle')}
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
              label={t('auth.nameLabel')}
              placeholder={t('auth.namePlaceholder')}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError(null);
              }}
              leftIcon={<User size={18} color={colors.textMuted} />}
            />

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

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (error) setError(null);
              }}
              secureTextEntry
              leftIcon={<Lock size={18} color={colors.textMuted} />}
            />

            <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
              {t('profile.disclaimerText')}
            </Text>

            <Button
              title={t('auth.signUp')}
              size="lg"
              loading={loading}
              onPress={handleRegister}
              iconRight={<ArrowRight size={18} color="#FFFFFF" />}
              style={styles.submitBtn}
            />
          </Card>

          {/* Footer Link */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {t('auth.alreadyHaveAccount')}{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                {t('auth.signIn')}
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
    marginBottom: 20,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
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
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 18,
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '800',
  },
});
