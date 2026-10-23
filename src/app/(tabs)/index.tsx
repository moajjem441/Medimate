import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Camera,
  Clock,
  Pill,
  FileText,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/use-theme';
import { useTranslation } from '../../context/LocalizationContext';
import { api } from '../../services/api';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { Loading } from '../../components/Loading';
import { MedicineCard, MedicineData } from '../../components/MedicineCard';
import { LiquidBackground } from '../../components/LiquidBackground';
import { AnimatedPressable } from '../../components/AnimatedPressable';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [medicines, setMedicines] = useState<MedicineData[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [takingDoseId, setTakingDoseId] = useState<string | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greetingMorning');
    if (hour < 17) return t('home.greetingAfternoon');
    return t('home.greetingEvening');
  };

  const loadDashboardData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const [medsRes, remindersRes, prescrRes] = await Promise.all([
        api.get('/medicines?active=true'),
        api.get('/reminders'),
        api.get('/prescriptions'),
      ]);

      setMedicines(medsRes.data.data || []);
      setReminders(remindersRes.data.data || []);
      setRecentPrescriptions(prescrRes.data.data?.slice(0, 2) || []);
    } catch (err: any) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleTakeDose = async (medicineId: string) => {
    try {
      setTakingDoseId(medicineId);
      await api.post(`/medicines/${medicineId}/log`, {
        status: 'TAKEN',
        notes: 'Recorded from home dashboard',
      });
      Alert.alert(t('home.doseTaken'), t('home.doseRecordedAlert'));
      loadDashboardData();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Could not log dose.');
    } finally {
      setTakingDoseId(null);
    }
  };

  const nextReminder = reminders.find((r) => r.isEnabled);

  if (loading && !refreshing) {
    return <Loading fullScreen message={t('common.loading')} />;
  }

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Top Greeting Bar */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.greetingText, { color: colors.textSecondary }]}>
                {getGreeting()}
              </Text>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.name || 'MediMate User'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.avatarButton,
                {
                  backgroundColor: colors.glassCard,
                  borderColor: colors.glassBorder,
                  borderTopColor: colors.glassHighlight,
                },
              ]}
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.75}
            >
              <Text style={[styles.avatarInitial, { color: colors.primary }]}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Medical Safety Notice Banner */}
          <DisclaimerBanner />

          {/* Primary CTA: Scan Doctor Prescription (Liquid Glass Hero Card) */}
          <AnimatedPressable
            onPress={() => router.push('/prescription/scan')}
            scaleTo={0.97}
            style={[
              styles.scanBannerContainer,
              {
                borderColor: colors.glassBorder,
                borderTopColor: colors.glassHighlight,
                shadowColor: colors.glassGlow,
              },
            ]}
          >
            <BlurView
              intensity={isDark ? 60 : 45}
              tint={colors.blurTint}
              style={StyleSheet.absoluteFill}
            />
            {/* Subtle Gradient Glow Layer */}
            <LinearGradient
              colors={
                isDark
                  ? ['rgba(13, 148, 136, 0.25)', 'rgba(15, 23, 42, 0.75)']
                  : ['rgba(204, 251, 241, 0.65)', 'rgba(255, 255, 255, 0.85)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.scanContentRow}>
              <View style={styles.scanTextCol}>
                <View
                  style={[
                    styles.scanTag,
                    {
                      backgroundColor: isDark
                        ? 'rgba(20, 184, 166, 0.25)'
                        : 'rgba(13, 148, 136, 0.12)',
                      borderColor: isDark
                        ? 'rgba(45, 212, 191, 0.4)'
                        : 'rgba(13, 148, 136, 0.25)',
                    },
                  ]}
                >
                  <Sparkles size={13} color={colors.primary} />
                  <Text style={[styles.scanTagText, { color: colors.primary }]}>
                    {t('scan.title')}
                  </Text>
                </View>
                <Text style={[styles.scanBannerTitle, { color: colors.text }]}>
                  {t('scan.heading')}
                </Text>
                <Text
                  style={[styles.scanBannerSubtitle, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {t('scan.subheading')}
                </Text>
              </View>

              <View
                style={[
                  styles.scanButtonCircle,
                  {
                    shadowColor: colors.primary,
                  },
                ]}
              >
                <LinearGradient
                  colors={colors.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Camera size={26} color="#FFFFFF" />
              </View>
            </View>
          </AnimatedPressable>

          {/* Next Scheduled Reminder Glass Card */}
          {nextReminder ? (
            <Card style={styles.nextReminderCard} glow>
              <View style={styles.reminderHeader}>
                <View style={styles.reminderTimeRow}>
                  <Clock size={18} color={colors.primary} />
                  <Text style={[styles.reminderLabel, { color: colors.primary }]}>
                    {t('home.nextReminder')}
                  </Text>
                </View>
                <Badge label={t('home.scheduled')} variant="teal" dot />
              </View>
              <Text style={[styles.reminderTime, { color: colors.text }]}>
                {nextReminder.time}
              </Text>
              <Text style={[styles.reminderMedicine, { color: colors.text }]}>
                {nextReminder.medicine?.name}{' '}
                <Text style={[styles.reminderDosage, { color: colors.textSecondary }]}>
                  ({nextReminder.medicine?.dosage})
                </Text>
              </Text>
              <Text style={[styles.reminderInstruction, { color: colors.textSecondary }]}>
                {nextReminder.medicine?.timing || t('common.asDirected')}
              </Text>
            </Card>
          ) : (
            <Card style={styles.noReminderCard}>
              <Clock size={20} color={colors.textMuted} />
              <Text style={[styles.noReminderText, { color: colors.textSecondary }]}>
                {t('home.noRemindersScheduled')}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/reminder/add')}
                style={styles.addReminderLink}
              >
                <Text style={[styles.addReminderLinkText, { color: colors.primary }]}>
                  {t('home.addReminder')}
                </Text>
              </TouchableOpacity>
            </Card>
          )}

          {/* Medicine Overview Glass Statistics */}
          <View style={styles.statsRow}>
            <Card style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {medicines.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('home.activeMeds')}
              </Text>
            </Card>
            <Card style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {reminders.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('home.statReminders')}
              </Text>
            </Card>
            <Card style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {recentPrescriptions.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('home.statPrescriptions')}
              </Text>
            </Card>
          </View>

          {/* Today's Active Medicines Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('home.todaysMedicines')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/medicines')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                {t('common.viewAll')}
              </Text>
            </TouchableOpacity>
          </View>

          {medicines.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Pill size={32} color={colors.primary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {t('home.noMedicinesAdded')}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {t('home.noMedicinesSubtitle')}
              </Text>
              <View style={styles.emptyActionsRow}>
                <Button
                  title={t('scan.heading')}
                  size="sm"
                  onPress={() => router.push('/prescription/scan')}
                  style={{ marginRight: 8 }}
                />
                <Button
                  title={t('home.addManually')}
                  variant="outline"
                  size="sm"
                  onPress={() => router.push('/medicine/add')}
                />
              </View>
            </Card>
          ) : (
            medicines.slice(0, 3).map((med) => (
              <MedicineCard
                key={med.id}
                medicine={med}
                onPress={() => router.push(`/medicine/${med.id}` as any)}
                onTakeDose={() => handleTakeDose(med.id)}
                isTaking={takingDoseId === med.id}
              />
            ))
          )}

          {/* Recent Prescriptions Shortcut */}
          {recentPrescriptions.length > 0 && (
            <View style={styles.recentPrescriptionSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('home.recentPrescriptions')}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/prescriptions')}
                >
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>
                    {t('home.viewHistory')}
                  </Text>
                </TouchableOpacity>
              </View>

              {recentPrescriptions.map((p) => (
                <AnimatedPressable
                  key={p.id}
                  style={[
                    styles.prescriptionMiniCard,
                    {
                      backgroundColor: colors.glassCard,
                      borderColor: colors.glassBorder,
                      borderTopColor: colors.glassHighlight,
                    },
                  ]}
                  onPress={() => router.push('/(tabs)/prescriptions')}
                >
                  <BlurView
                    intensity={isDark ? 50 : 35}
                    tint={colors.blurTint}
                    style={StyleSheet.absoluteFill}
                  />
                  <View
                    style={[
                      styles.prescMiniIcon,
                      {
                        backgroundColor: isDark
                          ? 'rgba(2, 132, 199, 0.2)'
                          : 'rgba(2, 132, 199, 0.12)',
                      },
                    ]}
                  >
                    <FileText size={18} color={colors.secondary} />
                  </View>
                  <View style={styles.prescMiniText}>
                    <Text style={[styles.prescMiniDoctor, { color: colors.text }]}>
                      {p.doctorName || t('prescriptions.doctor')}
                    </Text>
                    <Text
                      style={[styles.prescMiniDate, { color: colors.textSecondary }]}
                    >
                      {p.date
                        ? new Date(p.date).toLocaleDateString()
                        : new Date(p.createdAt).toLocaleDateString()}{' '}
                      • {p._count?.medicines || p.medicines?.length || 0}{' '}
                      {t('home.medicinesCount')}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </AnimatedPressable>
              ))}
            </View>
          )}
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderTopWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarInitial: {
    fontSize: 19,
    fontWeight: '800',
  },
  scanBannerContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderTopWidth: 1.5,
    marginVertical: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  scanContentRow: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanTextCol: {
    flex: 1,
    paddingRight: 14,
  },
  scanTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    marginBottom: 8,
  },
  scanTagText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
  },
  scanBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scanBannerSubtitle: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  scanButtonCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  nextReminderCard: {
    marginBottom: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  reminderTime: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  reminderMedicine: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  reminderDosage: {
    fontWeight: '500',
  },
  reminderInstruction: {
    fontSize: 13,
    marginTop: 4,
  },
  noReminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginBottom: 16,
  },
  noReminderText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  addReminderLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addReminderLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyActionsRow: {
    flexDirection: 'row',
  },
  recentPrescriptionSection: {
    marginTop: 10,
  },
  prescriptionMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderTopWidth: 1.5,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  prescMiniIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prescMiniText: {
    flex: 1,
  },
  prescMiniDoctor: {
    fontSize: 14,
    fontWeight: '700',
  },
  prescMiniDate: {
    fontSize: 12,
    marginTop: 2,
  },
});
