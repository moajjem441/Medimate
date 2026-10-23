import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Bell, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../services/api';
import { useTheme } from '../../hooks/use-theme';
import { useTranslation } from '../../context/LocalizationContext';
import { Header } from '../../components/Header';
import { ReminderCard, ReminderData } from '../../components/ReminderCard';
import { EmptyState } from '../../components/EmptyState';
import { Loading } from '../../components/Loading';
import { NotificationService } from '../../services/notifications';
import { useAuth } from '../../context/AuthContext';
import { LiquidBackground } from '../../components/LiquidBackground';

export default function RemindersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReminders = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/reminders');
      setReminders(res.data.data || []);
    } catch (err: any) {
      console.warn('Error loading reminders:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadReminders();
  };

  const handleToggle = async (reminder: ReminderData, newValue: boolean) => {
    try {
      // Optimistic update
      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? { ...r, isEnabled: newValue } : r))
      );

      await api.patch(`/reminders/${reminder.id}/toggle`, {
        isEnabled: newValue,
      });

      // Handle Expo Local Notification scheduling
      if (newValue && reminder.medicine) {
        await NotificationService.scheduleMedicineReminder(
          reminder.medicine.name,
          reminder.medicine.dosage,
          reminder.time,
          reminder.medicine.timing
        );
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Failed to update reminder status.');
      loadReminders();
    }
  };

  const handleDelete = (reminder: ReminderData) => {
    Alert.alert(
      t('common.delete'),
      `${reminder.time} (${reminder.medicine?.name || t('reminders.scheduledMedicine')})?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/reminders/${reminder.id}`);
              setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
            } catch (err: any) {
              Alert.alert(t('common.error'), err.message || 'Failed to delete reminder.');
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return <Loading fullScreen message={t('common.loading')} />;
  }

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <Header
          title={t('reminders.title')}
          subtitle={`${reminders.filter((r) => r.isEnabled).length} ${t('reminders.active')}`}
          rightAction={
            <TouchableOpacity
              style={styles.addHeaderBtn}
              onPress={() => router.push('/reminder/add')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.addHeaderBtnText}>{t('reminders.addNew')}</Text>
            </TouchableOpacity>
          }
        />

        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <ReminderCard
              reminder={item}
              onToggle={(newVal) => handleToggle(item, newVal)}
              onEdit={() =>
                router.push({
                  pathname: '/reminder/edit',
                  params: { id: item.id },
                })
              }
              onDelete={() => handleDelete(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<Bell size={32} color={colors.primary} />}
              title={t('reminders.noReminders')}
              description={t('reminders.noRemindersDesc')}
              actionTitle={t('reminders.createFirst')}
              onAction={() => router.push('/reminder/add')}
            />
          }
        />
      </SafeAreaView>
    </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
    flexGrow: 1,
  },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 5,
  },
});
