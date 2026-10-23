import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Bell, Edit3, Trash2 } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../hooks/use-theme';
import { useTranslation } from '../context/LocalizationContext';

export interface ReminderData {
  id: string;
  medicineId: string;
  time: string;
  days: string;
  isEnabled: boolean;
  medicine?: {
    id: string;
    name: string;
    dosage: string;
    timing: string;
    isActive: boolean;
  };
}

interface ReminderCardProps {
  reminder: ReminderData;
  onToggle: (newValue: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  reminder,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.cardContainer,
        {
          borderColor: colors.glassBorder,
          borderTopColor: colors.glassHighlight,
          shadowColor: reminder.isEnabled ? colors.glassGlow : colors.shadow,
        },
        !reminder.isEnabled && {
          opacity: 0.75,
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
          {
            backgroundColor: reminder.isEnabled
              ? colors.glassCard
              : colors.glassCardSubtle,
          },
        ]}
      >
        <View style={styles.leftCol}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: reminder.isEnabled
                  ? (isDark ? 'rgba(20, 184, 166, 0.22)' : 'rgba(13, 148, 136, 0.12)')
                  : (isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(241, 245, 249, 0.6)'),
                borderColor: reminder.isEnabled
                  ? (isDark ? 'rgba(45, 212, 191, 0.4)' : 'rgba(13, 148, 136, 0.3)')
                  : 'transparent',
              },
            ]}
          >
            <Bell
              size={20}
              color={reminder.isEnabled ? colors.primary : colors.textMuted}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.timeText,
                { color: colors.text },
                !reminder.isEnabled && { color: colors.textMuted },
              ]}
            >
              {reminder.time}
            </Text>
            <Text
              style={[
                styles.medicineText,
                { color: colors.text },
                !reminder.isEnabled && { color: colors.textMuted },
              ]}
            >
              {reminder.medicine?.name || t('reminders.scheduledMedicine')}{' '}
              <Text
                style={[
                  styles.dosageText,
                  { color: colors.textSecondary },
                  !reminder.isEnabled && { color: colors.textMuted },
                ]}
              >
                ({reminder.medicine?.dosage || t('reminders.dose')})
              </Text>
            </Text>
            <Text
              style={[
                styles.timingText,
                { color: reminder.isEnabled ? colors.primary : colors.textMuted },
              ]}
            >
              {reminder.medicine?.timing || reminder.days}
            </Text>
          </View>
        </View>

        <View style={styles.rightCol}>
          <Switch
            value={reminder.isEnabled}
            onValueChange={onToggle}
            trackColor={{
              false: isDark ? '#334155' : '#CBD5E1',
              true: isDark ? '#0D9488' : '#99F6E4',
            }}
            thumbColor={reminder.isEnabled ? colors.primary : (isDark ? '#64748B' : '#F1F5F9')}
          />
          <View style={styles.actionsRow}>
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                style={styles.actionBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Edit3 size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                style={styles.actionBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color={colors.error || '#EF4444'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
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
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  innerContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
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
  textContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  medicineText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  dosageText: {
    fontSize: 13,
    fontWeight: '500',
  },
  timingText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  rightCol: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
});
