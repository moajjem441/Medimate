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
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';

export default function EditMedicineScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [timing, setTiming] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const res = await api.get(`/medicines/${id}`);
      const m = res.data.data;
      setName(m.name || '');
      setDosage(m.dosage || '');
      setFrequency(m.frequency || '');
      setTiming(m.timing || '');
      setDuration(m.duration || '');
      setInstructions(m.instructions || '');
      setExplanation(m.explanation || '');
      setIsActive(m.isActive ?? true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load medicine.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim() || !dosage.trim() || !frequency.trim() || !timing.trim()) {
      setError('Please fill in required fields.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await api.patch(`/medicines/${id}`, {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        timing: timing.trim(),
        duration: duration.trim() || undefined,
        instructions: instructions.trim() || undefined,
        explanation: explanation.trim() || undefined,
        isActive,
      });

      Alert.alert('Updated', 'Medication updated successfully.');
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to update medicine.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading medication details..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Edit Medication" subtitle={name} showBack />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <Input
            label="Medication Name"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Dosage Strength"
            value={dosage}
            onChangeText={setDosage}
          />

          <Input
            label="Frequency"
            value={frequency}
            onChangeText={setFrequency}
          />

          <Input
            label="Timing Relation"
            value={timing}
            onChangeText={setTiming}
          />

          <Input
            label="Duration"
            value={duration}
            onChangeText={setDuration}
          />

          <Input
            label="Special Instructions"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            numberOfLines={2}
          />

          <Input
            label="Simple Explanation"
            value={explanation}
            onChangeText={setExplanation}
            multiline
            numberOfLines={2}
          />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Treatment Course Active</Text>
              <Text style={styles.toggleSubtitle}>
                Inactive medicines will be archived from the daily schedule
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#CBD5E1', true: '#99F6E4' }}
              thumbColor={isActive ? '#0D9488' : '#F1F5F9'}
            />
          </View>

          <Button
            title="Update Medication"
            size="lg"
            loading={saving}
            onPress={handleUpdate}
            style={{ marginTop: 12 }}
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
