import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell, Clock, Pill, Check } from 'lucide-react-native';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Loading } from '../../components/Loading';
import { NotificationService } from '../../services/notifications';
import { useTheme } from '../../hooks/use-theme';

const COMMON_TIMES = [
  '07:00 AM',
  '08:00 AM',
  '09:00 AM',
  '12:00 PM',
  '01:00 PM',
  '06:00 PM',
  '08:00 PM',
  '09:00 PM',
  '10:00 PM',
];

export default function AddReminderScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [medicines, setMedicines] = useState<any[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [time, setTime] = useState('08:00 AM');
  const [days, setDays] = useState('DAILY');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const res = await api.get('/medicines?active=true');
      const list = res.data.data || [];
      setMedicines(list);
      if (list.length > 0) {
        setSelectedMedId(list[0].id);
      }
    } catch (err: any) {
      console.warn('Error loading medicines:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMedId) {
      setError('Please select a medication to remind.');
      return;
    }

    if (!time.trim()) {
      setError('Please enter a reminder time.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await api.post('/reminders', {
        medicineId: selectedMedId,
        time: time.trim(),
        days,
        soundEnabled,
        isEnabled: true,
      });

      const reminder = res.data.data;
      const med = medicines.find((m) => m.id === selectedMedId);

      // Schedule local notification on device
      if (med) {
        await NotificationService.scheduleMedicineReminder(
          med.name,
          med.dosage,
          time.trim(),
          med.timing
        );
      }

      Alert.alert('Alarm Scheduled', `Daily reminder set for ${time}.`);
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule reminder.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading medications..." />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="New Reminder" subtitle="Schedule Medicine Alarm" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Medicine Selector */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Medication</Text>
        {medicines.length === 0 ? (
          <Card style={styles.noMedCard}>
            <Pill size={24} color={colors.textSecondary} />
            <Text style={[styles.noMedText, { color: colors.textSecondary }]}>No active medications found.</Text>
            <Button
              title="+ Add Medicine First"
              size="sm"
              onPress={() => router.push('/medicine/add')}
              style={{ marginTop: 10 }}
            />
          </Card>
        ) : (
          <View style={styles.medList}>
            {medicines.map((med) => {
              const isSelected = selectedMedId === med.id;
              return (
                <TouchableOpacity
                  key={med.id}
                  style={[
                    styles.medOption,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    isSelected && [styles.medOptionSelected, { borderColor: colors.primary }],
                  ]}
                  onPress={() => setSelectedMedId(med.id)}
                >
                  <View style={styles.medLeft}>
                    <View
                      style={[
                        styles.medIconBox,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : (isDark ? 'rgba(13, 148, 136, 0.2)' : '#F0FDFA'),
                        },
                      ]}
                    >
                      <Pill
                        size={18}
                        color={isSelected ? '#FFFFFF' : colors.primary}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.medOptionName,
                          { color: colors.text },
                          isSelected && { color: colors.primary },
                        ]}
                      >
                        {med.name}
                      </Text>
                      <Text style={[styles.medOptionDosage, { color: colors.textSecondary }]}>
                        {med.dosage} • {med.timing}
                      </Text>
                    </View>
                  </View>
                  {isSelected && <Check size={20} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Time Selection */}
        <Text style={styles.sectionTitle}>Select Alarm Time</Text>
        <Input
          label="Custom Time (e.g. 08:30 AM)"
          value={time}
          onChangeText={setTime}
          leftIcon={<Clock size={18} color="#64748B" />}
        />

        <Text style={styles.commonTimesLabel}>Or Choose Preset Time:</Text>
        <View style={styles.presetGrid}>
          {COMMON_TIMES.map((preset) => {
            const active = time === preset;
            return (
              <TouchableOpacity
                key={preset}
                style={[styles.presetPill, active && styles.presetPillActive]}
                onPress={() => setTime(preset)}
              >
                <Text
                  style={[styles.presetText, active && styles.presetTextActive]}
                >
                  {preset}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Settings */}
        <Card style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Sound & Vibration</Text>
              <Text style={styles.settingSubtitle}>
                Play audible chime when pill is due
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#CBD5E1', true: '#99F6E4' }}
              thumbColor={soundEnabled ? '#0D9488' : '#F1F5F9'}
            />
          </View>
        </Card>

        <Button
          title="Save Reminder Alarm"
          size="lg"
          loading={saving}
          disabled={medicines.length === 0}
          onPress={handleSave}
          icon={<Bell size={18} color="#FFFFFF" />}
          style={styles.saveBtn}
        />
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 6,
  },
  noMedCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  noMedText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
  },
  medList: {
    marginBottom: 16,
  },
  medOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  medOptionSelected: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  medLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medOptionName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  medOptionDosage: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  commonTimesLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  presetPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  presetPillActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  presetTextActive: {
    color: '#FFFFFF',
  },
  settingsCard: {
    marginBottom: 24,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  saveBtn: {
    width: '100%',
  },
});
