import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Stethoscope, Shield, Pill, ArrowRight, Clock } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/use-theme';
import { useTranslation } from '../context/LocalizationContext';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { Card } from '../components/Card';
import { LiquidBackground } from '../components/LiquidBackground';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return <Loading fullScreen message={t('common.loading')} />;
  }

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Top Branding Section */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <View
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
              >
                <Stethoscope size={36} color={colors.primary} strokeWidth={2.5} />
              </View>
            </View>

            <Text style={[styles.appName, { color: colors.text }]}>
              {t('common.appName')}
            </Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              {t('common.tagline')}
            </Text>
          </View>

          {/* Feature Highlights Frosted Card */}
          <Card style={styles.featuresCard} glow>
            <View style={[styles.featureRow, { borderBottomColor: colors.glassBorderSubtle }]}>
              <View
                style={[
                  styles.featureIcon,
                  {
                    backgroundColor: isDark
                      ? 'rgba(20, 184, 166, 0.2)'
                      : 'rgba(13, 148, 136, 0.12)',
                  },
                ]}
              >
                <Shield size={18} color={colors.primary} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {t('scan.title')}
                </Text>
                <Text style={[styles.featureSubtitle, { color: colors.textSecondary }]}>
                  {t('home.scanPrescriptionDesc')}
                </Text>
              </View>
            </View>

            <View style={[styles.featureRow, { borderBottomColor: colors.glassBorderSubtle }]}>
              <View
                style={[
                  styles.featureIcon,
                  {
                    backgroundColor: isDark
                      ? 'rgba(2, 132, 199, 0.2)'
                      : 'rgba(2, 132, 199, 0.12)',
                  },
                ]}
              >
                <Clock size={18} color={colors.secondary} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {t('reminders.title')}
                </Text>
                <Text style={[styles.featureSubtitle, { color: colors.textSecondary }]}>
                  {t('reminders.subtitle')}
                </Text>
              </View>
            </View>

            <View style={[styles.featureRow, { borderBottomWidth: 0 }]}>
              <View
                style={[
                  styles.featureIcon,
                  {
                    backgroundColor: isDark
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(34, 197, 94, 0.12)',
                  },
                ]}
              >
                <Pill size={18} color={colors.success} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>
                  {t('medicines.title')}
                </Text>
                <Text style={[styles.featureSubtitle, { color: colors.textSecondary }]}>
                  {t('medicines.subtitle')}
                </Text>
              </View>
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <Button
              title={t('auth.createAccount')}
              size="lg"
              onPress={() => router.push('/(auth)/register')}
              iconRight={<ArrowRight size={18} color="#FFFFFF" />}
              style={styles.getStartedBtn}
            />

            <Button
              title={t('auth.signIn')}
              variant="glass"
              size="lg"
              onPress={() => router.push('/(auth)/login')}
              style={styles.signInBtn}
            />

            {/* Quick Demo Access Note */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={styles.demoHint}
            >
              <Text style={[styles.demoHintText, { color: colors.textMuted }]}>
                {t('auth.demoUserHint')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  brandSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
    lineHeight: 21,
    fontWeight: '500',
  },
  featuresCard: {
    padding: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  featureSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  actionSection: {
    width: '100%',
    marginBottom: 10,
  },
  getStartedBtn: {
    marginBottom: 12,
  },
  signInBtn: {
    marginBottom: 10,
  },
  demoHint: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  demoHintText: {
    fontSize: 11,
  },
});
