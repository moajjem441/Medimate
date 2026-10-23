import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Loading } from '../../components/Loading';

export default function EditReminderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [reminder, setReminder] = useState<any | null>(null);
  const [time, setTime] = useState('');
  const [days, setDays] = useState('DAILY');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const res = await api.get('/reminders');
      const all: any[] = res.data.data || [];
      const found = all.find((r) => r.id === id);
      if (found) {
        setReminder(found);
        setTime(found.time || '');
        setDays(found.days || 'DAILY');
        setSoundEnabled(found.soundEnabled ?? true);
        setIsEnabled(found.isEnabled ?? true);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load reminder.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!time.trim()) {
      setError('Please provide a valid reminder time.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await api.patch(`/reminders/${id}`, {
        time: time.trim(),
        days,
        soundEnabled,
        isEnabled,
      });

      Alert.alert('Updated', 'Reminder updated successfully.');
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to update reminder.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading reminder settings..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Edit Reminder"
        subtitle={reminder?.medicine?.name || 'Scheduled Alarm'}
        showBack
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <Input
            label="Alarm Time (e.g. 08:00 AM)"
            value={time}
            onChangeText={setTime}
            leftIcon={<Clock size={18} color="#64748B" />}
          />

          <Input
            label="Recurrence Frequency"
            value={days}
            onChangeText={setDays}
            helperText="e.g. DAILY, WEEKDAYS, MON,WED,FRI"
          />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Reminder Active</Text>
              <Text style={styles.toggleSubtitle}>Turn notifications on or off</Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: '#CBD5E1', true: '#99F6E4' }}
              thumbColor={isEnabled ? '#0D9488' : '#F1F5F9'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Sound & Alert</Text>
              <Text style={styles.toggleSubtitle}>Ring notification tone</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#CBD5E1', true: '#99F6E4' }}
              thumbColor={soundEnabled ? '#0D9488' : '#F1F5F9'}
            />
          </View>

          <Button
            title="Save Changes"
            size="lg"
            loading={saving}
            onPress={handleUpdate}
            style={{ marginTop: 14 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
