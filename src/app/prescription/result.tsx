import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Pill,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Building,
} from 'lucide-react-native';
import { api } from '../../services/api';
import { useTheme } from '../../hooks/use-theme';
import { useTranslation } from '../../context/LocalizationContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { LiquidBackground } from '../../components/LiquidBackground';

export default function PrescriptionResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [saving, setSaving] = useState(false);

  let analysis: any = null;
  try {
    if (params.analysis) {
      analysis = JSON.parse(params.analysis as string);
    }
  } catch (e) {
    console.error('Failed to parse analysis param', e);
  }

  const imageUri = (params.imageUri as string) || '';

  if (!analysis) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <Header title={t('result.title')} showBack />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            No prescription analysis data available.
          </Text>
          <Button
            title={t('result.scanAgain')}
            onPress={() => router.replace('/prescription/scan')}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isLegible = analysis.isLegible !== false;
  const medicines = analysis.extractedMedicines || [];

  const handleSaveToSchedule = async () => {
    try {
      setSaving(true);
      await api.post('/prescriptions', {
        imageUri: analysis.imageUrl || imageUri,
        doctorName: analysis.doctorName,
        clinicName: analysis.clinicName,
        date: analysis.date,
        rawNotes: analysis.rawNotes,
        autoCreateMedicines: true,
        medicines,
      });

      Alert.alert(
        t('result.savedAlertTitle'),
        t('result.savedAlertMsg'),
        [
          {
            text: t('result.viewDashboard'),
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Failed to save prescription.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title={t('result.title')}
          subtitle={isLegible ? t('result.verifiedDesc') : 'Readability Notice'}
          showBack
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Prominent Healthcare Disclaimer */}
        <DisclaimerBanner
          type={isLegible ? 'disclaimer' : 'warning'}
          title={isLegible ? t('disclaimer.noticeTitle') : t('result.unclearTitle')}
          message={
            analysis.disclaimer ||
            t('disclaimer.defaultMessage')
          }
        />

        {/* If Image was Unclear or Illegible */}
        {!isLegible ? (
          <Card style={styles.unclearCard}>
            <AlertTriangle size={36} color="#D97706" />
            <Text style={styles.unclearTitle}>Prescription Cannot Be Read Clearly</Text>
            <Text style={styles.unclearDesc}>
              For patient safety, MediMate will not invent or guess medicine names or
              dosages from blurred, shadowed, or ambiguous doctor handwriting.
            </Text>

            {analysis.warnings && analysis.warnings.length > 0 && (
              <View style={styles.warningsList}>
                {analysis.warnings.map((w: string, i: number) => (
                  <Text key={i} style={styles.warningItem}>
                    • {w}
                  </Text>
                ))}
              </View>
            )}

            <Button
              title={t('result.scanAgain')}
              onPress={() => router.replace('/prescription/scan')}
              style={{ marginTop: 20, width: '100%' }}
            />
          </Card>
        ) : (
          <>
            {/* Doctor & Clinic Header Card */}
            <Card style={styles.metaCard}>
              <View style={styles.metaRow}>
                <UserCheck size={18} color={colors.primary} />
                <Text style={[styles.doctorName, { color: colors.text }]}>
                  {analysis.doctorName || t('result.doctorName')}
                </Text>
              </View>
              {analysis.clinicName && (
                <View style={styles.metaRow}>
                  <Building size={16} color={colors.textSecondary} />
                  <Text style={[styles.clinicName, { color: colors.textSecondary }]}>
                    {analysis.clinicName}
                  </Text>
                </View>
              )}
              {analysis.date && (
                <View style={styles.metaRow}>
                  <Calendar size={16} color={colors.textSecondary} />
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                    {analysis.date}
                  </Text>
                </View>
              )}
            </Card>

            {/* Extracted Medicines List */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('result.extractedMedicines')} ({medicines.length})
              </Text>
              <Badge label="AI Extracted" variant="teal" />
            </View>

            {medicines.map((med: any, idx: number) => {
              const confPct =
                typeof med.confidence === 'number'
                  ? Math.round(med.confidence * 100)
                  : 85;
              const badgeVariant =
                confPct >= 80 ? 'teal' : confPct >= 60 ? 'amber' : 'red';

              const hasDetails =
                med.frequency || med.timing || med.duration;

              return (
                <Card key={idx} style={styles.medicineCard}>
                  <View style={styles.medTopRow}>
                    <View
                      style={[
                        styles.medIconBox,
                        {
                          backgroundColor: isDark
                            ? 'rgba(13, 148, 136, 0.2)'
                            : '#F0FDFA',
                        },
                      ]}
                    >
                      <Pill size={20} color={colors.primary} />
                    </View>
                    <View style={styles.medTitleBox}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[styles.medName, { color: colors.text }]}>
                          {med.name}
                        </Text>
                        <Badge
                          label={`${confPct}%`}
                          variant={badgeVariant}
                        />
                      </View>
                      {med.dosage ? (
                        <Text style={[styles.medDosage, { color: colors.textSecondary }]}>
                          {med.dosage}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {hasDetails && (
                    <View
                      style={[
                        styles.medDetailsGrid,
                        { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' },
                      ]}
                    >
                      {med.frequency ? (
                        <View style={styles.detailRow}>
                          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                            {t('result.frequency')}:
                          </Text>
                          <Text style={[styles.detailValue, { color: colors.text }]}>
                            {med.frequency}
                          </Text>
                        </View>
                      ) : null}

                      {med.timing ? (
                        <View style={styles.detailRow}>
                          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                            {t('result.timing')}:
                          </Text>
                          <Text style={[styles.detailValue, { color: colors.text }]}>
                            {med.timing}
                          </Text>
                        </View>
                      ) : null}

                      {med.duration ? (
                        <View style={styles.detailRow}>
                          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                            {t('result.duration')}:
                          </Text>
                          <Text style={[styles.detailValue, { color: colors.text }]}>
                            {med.duration}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  )}

                  {med.instructions ? (
                    <View
                      style={[
                        styles.instructionBox,
                        {
                          backgroundColor: isDark
                            ? 'rgba(22, 101, 52, 0.2)'
                            : '#F0FDF4',
                        },
                      ]}
                    >
                      <Text style={styles.instructionLabel}>
                        {t('result.instructions')}:
                      </Text>
                      <Text
                        style={[
                          styles.instructionText,
                          { color: isDark ? '#86EFAC' : '#14532D' },
                        ]}
                      >
                        {med.instructions}
                      </Text>
                    </View>
                  ) : null}

                  {med.explanation ? (
                    <View
                      style={[
                        styles.explanationBox,
                        {
                          backgroundColor: isDark
                            ? 'rgba(3, 105, 161, 0.2)'
                            : '#F0F9FF',
                        },
                      ]}
                    >
                      <Text style={styles.explanationLabel}>
                        {t('result.purpose')}:
                      </Text>
                      <Text
                        style={[
                          styles.explanationText,
                          { color: isDark ? '#7DD3FC' : '#0C4A6E' },
                        ]}
                      >
                        {med.explanation}
                      </Text>
                    </View>
                  ) : null}

                  {confPct < 60 && (
                    <View style={styles.lowConfNotice}>
                      <AlertTriangle size={14} color="#D97706" />
                      <Text style={styles.lowConfText}>
                        Handwriting confidence is low. Please verify medicine name before taking.
                      </Text>
                    </View>
                  )}
                </Card>
              );
            })}

            {/* Warnings from Analysis */}
            {analysis.warnings && analysis.warnings.length > 0 && (
              <Card style={styles.warningsCard}>
                <Text style={styles.warningsCardTitle}>⚠️ Important Considerations</Text>
                {analysis.warnings.map((w: string, i: number) => (
                  <Text key={i} style={styles.warningBullet}>
                    • {w}
                  </Text>
                ))}
              </Card>
            )}

            {/* Save & Schedule Button */}
            <View style={styles.actionsSection}>
              <Button
                title={t('result.saveToSchedule')}
                size="lg"
                loading={saving}
                onPress={handleSaveToSchedule}
                iconRight={<CheckCircle2 size={20} color="#FFFFFF" />}
                style={styles.saveBtn}
              />

              <Button
                title={t('result.scanAgain')}
                variant="ghost"
                onPress={() => router.replace('/prescription/scan')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
  },
  unclearCard: {
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  unclearTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  unclearDesc: {
    fontSize: 14,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  warningsList: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 10,
    width: '100%',
  },
  warningItem: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
    marginBottom: 4,
  },
  metaCard: {
    marginBottom: 16,
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  clinicName: {
    fontSize: 13,
    marginLeft: 8,
  },
  dateText: {
    fontSize: 13,
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  medicineCard: {
    marginBottom: 14,
    padding: 16,
  },
  medTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medTitleBox: {
    flex: 1,
  },
  medName: {
    fontSize: 17,
    fontWeight: '700',
  },
  medDosage: {
    fontSize: 13,
    marginTop: 1,
  },
  medDetailsGrid: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  instructionBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  instructionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 13,
    lineHeight: 18,
  },
  explanationBox: {
    padding: 10,
    borderRadius: 8,
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  lowConfNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  lowConfText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 6,
    flex: 1,
  },
  warningsCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    marginBottom: 20,
    padding: 14,
  },
  warningsCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  warningBullet: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
    marginBottom: 4,
  },
  actionsSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtn: {
    marginBottom: 10,
  },
});
