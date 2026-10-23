import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Pill, Clock, Check, ChevronRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Badge } from './Badge';
import { useTheme } from '../context/ThemeContext';
import { AnimatedPressable } from './AnimatedPressable';

export interface MedicineData {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration?: string;
  instructions?: string;
  explanation?: string;
  isActive: boolean;
  prescription?: {
    id: string;
    doctorName?: string;
  };
  reminders?: Array<{
    id: string;
    time: string;
    isEnabled: boolean;
  }>;
}

interface MedicineCardProps {
  medicine: MedicineData;
  onPress: () => void;
  onTakeDose?: () => void;
  isTaking?: boolean;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onPress,
  onTakeDose,
  isTaking = false,
}) => {
  const { colors, isDark } = useTheme();

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
          <View style={styles.titleRow}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: isDark
                    ? 'rgba(20, 184, 166, 0.18)'
                    : 'rgba(13, 148, 136, 0.12)',
                  borderColor: isDark
                    ? 'rgba(45, 212, 191, 0.4)'
                    : 'rgba(13, 148, 136, 0.3)',
                },
              ]}
            >
              <Pill size={20} color={colors.primary} />
            </View>
            <View style={styles.nameContainer}>
              <Text style={[styles.name, { color: colors.text }]}>
                {medicine.name}
              </Text>
              <Text style={[styles.dosage, { color: colors.textSecondary }]}>
                {medicine.dosage}
              </Text>
            </View>
          </View>
          <Badge
            label={medicine.isActive ? 'Active' : 'Inactive'}
            variant={medicine.isActive ? 'teal' : 'slate'}
            dot
          />
        </View>

        <View
          style={[
            styles.infoGrid,
            {
              backgroundColor: colors.glassCardSubtle,
              borderColor: colors.glassBorderSubtle,
            },
          ]}
        >
          <View style={styles.infoItem}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {medicine.timing}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.frequencyText, { color: colors.secondary }]}>
              {medicine.frequency}
            </Text>
          </View>
        </View>

        {medicine.explanation ? (
          <Text
            style={[styles.explanation, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {medicine.explanation}
          </Text>
        ) : null}

        <View
          style={[
            styles.actionRow,
            { borderTopColor: colors.glassBorderSubtle },
          ]}
        >
          {onTakeDose && medicine.isActive ? (
            <TouchableOpacity
              style={[
                styles.takeButton,
                {
                  backgroundColor: isDark
                    ? 'rgba(20, 184, 166, 0.2)'
                    : 'rgba(13, 148, 136, 0.12)',
                  borderColor: colors.primary,
                },
              ]}
              onPress={onTakeDose}
              disabled={isTaking}
              activeOpacity={0.7}
            >
              <Check size={14} color={colors.primary} />
              <Text style={[styles.takeButtonText, { color: colors.primary }]}>
                {isTaking ? 'Logging...' : 'Mark as Taken'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          <View style={styles.viewDetailsRow}>
            <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
              Details
            </Text>
            <ChevronRight size={16} color={colors.primary} />
          </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  dosage: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  explanation: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  takeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  takeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 5,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 2,
  },
});
