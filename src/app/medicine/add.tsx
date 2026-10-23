import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Pill, Plus } from 'lucide-react-native';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { NotificationService } from '../../services/notifications';
import { useTheme } from '../../hooks/use-theme';
import { useTranslation } from '../../context/LocalizationContext';

export default function AddMedicineScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('2 times daily');
  const [timing, setTiming] = useState('After meal');
  const [duration, setDuration] = useState('7 days');
  const [instructions, setInstructions] = useState('');
  const [explanation, setExplanation] = useState('');
  const [autoReminder, setAutoReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00 AM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim() || !dosage.trim() || !frequency.trim() || !timing.trim()) {
      setError('Please fill in medication name, dosage, frequency, and timing.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Create medicine
      const res = await api.post('/medicines', {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        timing: timing.trim(),
        duration: duration.trim() || undefined,
        instructions: instructions.trim() || undefined,
        explanation: explanation.trim() || undefined,
      });

      const createdMed = res.data.data;

      // 2. Optionally create reminder
      if (autoReminder && createdMed) {
        await api.post('/reminders', {
          medicineId: createdMed.id,
          time: reminderTime,
          days: 'DAILY',
          isEnabled: true,
        });

        await NotificationService.scheduleMedicineReminder(
          createdMed.name,
          createdMed.dosage,
          reminderTime,
          createdMed.timing
        );
      }

      Alert.alert('Success', 'Medication added successfully.');
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to add medicine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header title="Add Medication" subtitle="Manual Entry" showBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View
          style={[
            styles.formCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Input
            label="Medication Name *"
            placeholder="e.g. Paracetamol, Amoxicillin"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (error) setError(null);
            }}
            leftIcon={<Pill size={18} color="#0D9488" />}
          />

          <Input
            label="Dosage Strength *"
            placeholder="e.g. 500 mg, 10 ml, 1 tablet"
            value={dosage}
            onChangeText={(t) => {
              setDosage(t);
              if (error) setError(null);
            }}
          />

          <Input
            label="Frequency *"
            placeholder="e.g. 2 times daily, Every 8 hours"
            value={frequency}
            onChangeText={setFrequency}
          />

          <Input
            label="Timing Relation *"
            placeholder="e.g. After meal, Before meal, Bedtime"
            value={timing}
            onChangeText={setTiming}
          />

          <Input
            label="Duration"
            placeholder="e.g. 5 days, 10 days, Ongoing"
            value={duration}
            onChangeText={setDuration}
          />

          <Input
            label="Doctor's Special Instructions"
            placeholder="e.g. Take with a full glass of water, complete entire course"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={2}
          />

          <Input
            label="Simple Purpose / Explanation"
            placeholder="e.g. Pain reliever and fever reducer"
            value={explanation}
            onChangeText={setExplanation}
            multiline
            numberOfLines={2}
          />

          {/* Auto Reminder Option */}
          <View style={[styles.reminderToggleRow, { borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>Create Daily Reminder</Text>
              <Text style={[styles.toggleSubtitle, { color: colors.textSecondary }]}>
                Automatically schedule alarm at {reminderTime}
              </Text>
            </View>
            <Switch
              value={autoReminder}
              onValueChange={setAutoReminder}
              trackColor={{ false: '#CBD5E1', true: colors.primaryLight }}
              thumbColor={autoReminder ? colors.primary : '#F1F5F9'}
            />
          </View>

          {autoReminder && (
            <Input
              label="Reminder Time"
              placeholder="e.g. 09:00 AM"
              value={reminderTime}
              onChangeText={setReminderTime}
            />
          )}

          <Button
            title="Save Medication"
            size="lg"
            loading={loading}
            onPress={handleSave}
            icon={<Plus size={18} color="#FFFFFF" />}
            style={{ marginTop: 8 }}
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
  reminderToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
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
