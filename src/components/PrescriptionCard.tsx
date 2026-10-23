import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileText, Calendar, ChevronRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Badge } from './Badge';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LocalizationContext';
import { AnimatedPressable } from './AnimatedPressable';

export interface PrescriptionData {
  id: string;
  imageUri: string;
  doctorName?: string;
  clinicName?: string;
  date?: string;
  status: string;
  createdAt: string;
  notes?: string;
  _count?: {
    medicines: number;
  };
  medicines?: Array<{
    id: string;
    name: string;
    dosage: string;
  }>;
}

interface PrescriptionCardProps {
  prescription: PrescriptionData;
  onPress: () => void;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
  onPress,
}) => {
  const { colors, isDark } = useTheme();
  const { t, locale } = useTranslation();

  const medicineCount =
    prescription._count?.medicines ?? prescription.medicines?.length ?? 0;

  const formattedDate = prescription.date
    ? new Date(prescription.date).toLocaleDateString(
        locale === 'bn' ? 'bn-BD' : 'en-US',
        {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }
      )
    : new Date(prescription.createdAt).toLocaleDateString(
        locale === 'bn' ? 'bn-BD' : 'en-US',
        {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }
      );

  return (
    <AnimatedPressable
      onPress={onPress}
      scaleTo={0.98}
      style={[
        styles.cardContainer,
        {
          borderColor: colors.glassBorder,
          borderTopColor: colors.glassHighlight,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <BlurView
        intensity={isDark ? 55 : 40}
        tint={colors.blurTint}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.innerContent,
          { backgroundColor: colors.glassCard },
        ]}
      >
        <View style={styles.topRow}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDark
                  ? 'rgba(2, 132, 199, 0.18)'
                  : 'rgba(2, 132, 199, 0.12)',
                borderColor: isDark
                  ? 'rgba(56, 189, 248, 0.4)'
                  : 'rgba(2, 132, 199, 0.3)',
              },
            ]}
          >
            <FileText size={20} color={colors.secondary} />
          </View>
          <View style={styles.metaContainer}>
            <Text style={[styles.doctorName, { color: colors.text }]}>
              {prescription.doctorName || t('prescriptions.doctor')}
            </Text>
            {prescription.clinicName && (
              <Text
                style={[styles.clinicName, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {prescription.clinicName}
              </Text>
            )}
          </View>
          <Badge
            label={
              prescription.status === 'COMPLETED'
                ? t('prescriptions.legible')
                : t('prescriptions.unclear')
            }
            variant={prescription.status === 'COMPLETED' ? 'green' : 'amber'}
            dot
          />
        </View>

        <View
          style={[
            styles.detailsRow,
            { borderColor: colors.glassBorderSubtle },
          ]}
        >
          <View style={styles.itemRow}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={[styles.itemText, { color: colors.textSecondary }]}>
              {formattedDate}
            </Text>
          </View>
          <Badge
            label={`${medicineCount} ${t('prescriptions.medicinesCount')}`}
            variant="blue"
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.viewText, { color: colors.secondary }]}>
            {t('common.viewAll')}
          </Text>
          <ChevronRight size={16} color={colors.secondary} />
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderTopWidth: 1.5,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  innerContent: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  metaContainer: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  clinicName: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  viewText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
