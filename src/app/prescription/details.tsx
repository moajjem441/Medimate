import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  FileText,
  Calendar,
  Building,
  User,
  Pill,
  Trash2,
  ChevronRight,
  X,
  Maximize2,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { api, SERVER_HOST } from '../../services/api';
import { useTheme } from '../../hooks/use-theme';
import { useTranslation } from '../../context/LocalizationContext';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Loading } from '../../components/Loading';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { LiquidBackground } from '../../components/LiquidBackground';

export default function PrescriptionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const { t, locale } = useTranslation();

  const [prescription, setPrescription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    if (id) loadDetails();
  }, [id]);

  const loadDetails = async () => {
    try {
      const res = await api.get(`/prescriptions/${id}`);
      setPrescription(res.data.data);
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Failed to load prescription.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('prescriptions.deleteConfirmTitle'),
      t('prescriptions.deleteConfirmMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/prescriptions/${id}`);
              Alert.alert(t('common.success'), t('prescriptions.deletedSuccess'));
              router.back();
            } catch (err: any) {
              Alert.alert(t('common.error'), err.message || 'Failed to delete prescription.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading fullScreen message={t('common.loading')} />;
  }

  if (!prescription) {
    return (
      <LiquidBackground>
        <SafeAreaView style={styles.safeArea}>
          <Header title={t('prescriptions.detailsTitle')} showBack />
          <View style={styles.notFound}>
            <Card style={styles.notFoundCard}>
              <FileText size={48} color={colors.textTertiary} style={{ alignSelf: 'center', marginBottom: 12 }} />
              <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
                {t('prescriptions.notFound')}
              </Text>
            </Card>
          </View>
        </SafeAreaView>
      </LiquidBackground>
    );
  }

  const imageUrl = prescription.imageUri?.startsWith('http')
    ? prescription.imageUri
    : `${SERVER_HOST}${prescription.imageUri}`;

  const rawDate = prescription.date || prescription.createdAt;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title={t('prescriptions.detailsTitle')}
          subtitle={prescription.doctorName || t('prescriptions.doctorPrescription')}
          showBack
          rightAction={
            <TouchableOpacity
              onPress={handleDelete}
              style={[
                styles.deleteBtn,
                {
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.16)' : 'rgba(239, 68, 68, 0.1)',
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : 'rgba(239, 68, 68, 0.25)',
                },
              ]}
              activeOpacity={0.7}
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          }
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Prescription Image */}
          {prescription.imageUri ? (
            <AnimatedPressable
              onPress={() => setImageModalVisible(true)}
              style={styles.imagePressable}
            >
              <View
                style={[
                  styles.imageContainer,
                  {
                    borderColor: colors.glassBorder,
                    borderTopColor: colors.glassHighlight,
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(241, 245, 249, 0.65)',
                  },
                ]}
              >
                <BlurView
                  intensity={isDark ? 40 : 25}
                  tint={colors.blurTint}
                  style={StyleSheet.absoluteFill}
                />
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.image}
                  resizeMode="contain"
                />
                <View style={styles.imageOverlayRow}>
                  <Badge
                    label={t('prescriptions.legible')}
                    variant="teal"
                    icon={<FileText size={12} color={colors.primary} />}
                  />
                  <View
                    style={[
                      styles.zoomBadge,
                      {
                        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.85)',
                        borderColor: colors.glassBorder,
                      },
                    ]}
                  >
                    <Maximize2 size={14} color={colors.text} />
                  </View>
                </View>
              </View>
            </AnimatedPressable>
          ) : null}

          {/* Doctor & Clinic Info Card */}
          <Card glow style={styles.infoCard}>
            <View style={styles.doctorHeaderRow}>
              <View
                style={[
                  styles.avatarBox,
                  {
                    backgroundColor: isDark ? 'rgba(45, 212, 191, 0.16)' : 'rgba(13, 148, 136, 0.12)',
                    borderColor: colors.glassBorder,
                  },
                ]}
              >
                <User size={22} color={colors.primary} />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={[styles.doctorName, { color: colors.text }]}>
                  {prescription.doctorName || t('prescriptions.licensedPhysician')}
                </Text>
                {prescription.clinicName ? (
                  <View style={styles.clinicRow}>
                    <Building size={14} color={colors.textSecondary} />
                    <Text style={[styles.clinicText, { color: colors.textSecondary }]}>
                      {prescription.clinicName}
                    </Text>
                  </View>
                ) : null}
              </View>
              {prescription.status ? (
                <Badge
                  label={prescription.status === 'COMPLETED' ? t('prescriptions.legible') : prescription.status}
                  variant="teal"
                  dot
                />
              ) : null}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />

            <View style={styles.dateRow}>
              <Calendar size={15} color={colors.primary} />
              <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
                {t('prescriptions.prescribed')}:{' '}
              </Text>
              <Text style={[styles.dateValue, { color: colors.text }]}>
                {formattedDate}
              </Text>
            </View>
          </Card>

          {/* Clinical Notes Card */}
          {prescription.notes ? (
            <Card style={styles.notesCard}>
              <View style={styles.notesHeader}>
                <FileText size={16} color={colors.primary} />
                <Text style={[styles.notesTitle, { color: colors.text }]}>
                  {t('prescriptions.clinicalNotes')}
                </Text>
              </View>
              <Text style={[styles.notesContent, { color: colors.textSecondary }]}>
                {prescription.notes}
              </Text>
            </Card>
          ) : null}

          {/* Extracted Medications Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('prescriptions.medicationsInPrescription')}
            </Text>
            <View
              style={[
                styles.countBadge,
                {
                  backgroundColor: isDark ? 'rgba(45, 212, 191, 0.18)' : 'rgba(13, 148, 136, 0.12)',
                  borderColor: colors.glassBorder,
                },
              ]}
            >
              <Text style={[styles.countText, { color: colors.primary }]}>
                {prescription.medicines?.length || 0}
              </Text>
            </View>
          </View>

          {prescription.medicines?.map((med: any) => (
            <AnimatedPressable
              key={med.id}
              onPress={() => router.push(`/medicine/${med.id}` as any)}
              style={styles.medPressable}
            >
              <Card style={styles.medCard}>
                <View style={styles.medHeader}>
                  <View
                    style={[
                      styles.medIconBox,
                      {
                        backgroundColor: isDark
                          ? 'rgba(45, 212, 191, 0.16)'
                          : 'rgba(13, 148, 136, 0.12)',
                        borderColor: colors.glassBorder,
                      },
                    ]}
                  >
                    <Pill size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.medName, { color: colors.text }]}>
                      {med.name}
                    </Text>
                    {med.dosage ? (
                      <Text style={[styles.medDosage, { color: colors.textSecondary }]}>
                        {med.dosage}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.medStatusRight}>
                    <Badge
                      label={med.isActive ? t('prescriptions.active') : t('prescriptions.completed')}
                      variant={med.isActive ? 'teal' : 'slate'}
                      dot
                    />
                    <ChevronRight size={16} color={colors.textTertiary} style={{ marginTop: 4 }} />
                  </View>
                </View>

                {/* Frequency & Timing grid */}
                <View
                  style={[
                    styles.medGrid,
                    {
                      backgroundColor: colors.glassCardSubtle,
                      borderColor: colors.glassBorderSubtle,
                    },
                  ]}
                >
                  <View style={styles.medGridCol}>
                    <Text style={[styles.medGridLabel, { color: colors.textSecondary }]}>
                      {t('medicines.frequency')}
                    </Text>
                    <Text style={[styles.medGridValue, { color: colors.text }]}>
                      {med.frequency || '—'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.gridDivider,
                      { backgroundColor: colors.glassBorderSubtle },
                    ]}
                  />
                  <View style={styles.medGridCol}>
                    <Text style={[styles.medGridLabel, { color: colors.textSecondary }]}>
                      {t('medicines.timing')}
                    </Text>
                    <Text style={[styles.medGridValue, { color: colors.text }]}>
                      {med.timing || '—'}
                    </Text>
                  </View>
                </View>

                {med.explanation ? (
                  <Text
                    style={[styles.medExplanation, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {med.explanation}
                  </Text>
                ) : null}
              </Card>
            </AnimatedPressable>
          ))}
        </ScrollView>

        {/* Full Image Modal */}
        <Modal
          visible={imageModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {prescription.doctorName || t('prescriptions.detailsTitle')}
                </Text>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setImageModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalImageWrapper}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.modalFullImage}
                  resizeMode="contain"
                />
              </View>
            </SafeAreaView>
          </View>
        </Modal>
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
    paddingBottom: 40,
  },
  notFound: {
    padding: 20,
    marginTop: 40,
  },
  notFoundCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  imagePressable: {
    marginBottom: 16,
  },
  imageContainer: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderTopWidth: 1.5,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlayRow: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  zoomBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  infoCard: {
    marginBottom: 16,
  },
  doctorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  clinicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  clinicText: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  notesCard: {
    marginBottom: 16,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  notesContent: {
    fontSize: 13,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  countBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  medPressable: {
    marginBottom: 12,
  },
  medCard: {
    padding: 14,
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 10,
  },
  medName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  medDosage: {
    fontSize: 12,
    marginTop: 2,
  },
  medStatusRight: {
    alignItems: 'flex-end',
  },
  medGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  medGridCol: {
    flex: 1,
  },
  medGridLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  medGridValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  gridDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  medExplanation: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  modalSafeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  modalCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageWrapper: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFullImage: {
    width: '100%',
    height: '100%',
  },
});
