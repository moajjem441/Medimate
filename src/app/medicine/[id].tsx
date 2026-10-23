import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Pill,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  DollarSign,
  FileText,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';

export default function MedicineDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [medicine, setMedicine] = useState<any | null>(null);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [takingDose, setTakingDose] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const res = await api.get(`/medicines/${id}`);
      const med = res.data.data;
      setMedicine(med);

      // Fetch verified pricing benchmarks for this medicine
      if (med?.name) {
        try {
          const pricesRes = await api.get(`/prices/medicine/${encodeURIComponent(med.name)}`);
          setPriceData(pricesRes.data.data || []);
        } catch (pe) {
          console.warn('Price lookup error:', pe);
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load medicine details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogDose = async (status: 'TAKEN' | 'SKIPPED') => {
    try {
      setTakingDose(true);
      await api.post(`/medicines/${id}/log`, {
        status,
        notes: `Logged manually via app`,
      });
      Alert.alert(
        'Recorded',
        `Medication marked as ${status === 'TAKEN' ? 'taken' : 'skipped'}.`
      );
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to record dose.');
    } finally {
      setTakingDose(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Medicine',
      `Are you sure you want to remove ${medicine?.name} and its reminders from your schedule?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/medicines/${id}`);
              Alert.alert('Deleted', 'Medicine removed successfully.');
              router.back();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete medicine.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading fullScreen message="Loading medicine profile..." />;
  }

  if (!medicine) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Medicine" showBack />
        <View style={styles.notFound}>
          <Text>Medicine not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={medicine.name}
        subtitle={medicine.dosage}
        showBack
        rightAction={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                router.push({
                  pathname: '/medicine/edit',
                  params: { id: medicine.id },
                })
              }
            >
              <Edit3 size={18} color="#0D9488" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Details Card */}
        <Card style={styles.mainCard}>
          <View style={styles.titleRow}>
            <View style={styles.medIconBox}>
              <Pill size={24} color="#0D9488" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.medName}>{medicine.name}</Text>
              <Text style={styles.medDosage}>{medicine.dosage}</Text>
            </View>
            <Badge
              label={medicine.isActive ? 'Active Course' : 'Inactive'}
              variant={medicine.isActive ? 'teal' : 'slate'}
            />
          </View>

          <View style={styles.scheduleGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Frequency</Text>
              <Text style={styles.gridVal}>{medicine.frequency}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Timing</Text>
              <Text style={styles.gridVal}>{medicine.timing}</Text>
            </View>
            {medicine.duration && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Duration</Text>
                <Text style={styles.gridVal}>{medicine.duration}</Text>
              </View>
            )}
          </View>

          {medicine.instructions ? (
            <View style={styles.instructionCard}>
              <Text style={styles.instructionHeader}>Doctor's Instructions</Text>
              <Text style={styles.instructionBody}>{medicine.instructions}</Text>
            </View>
          ) : null}

          {medicine.explanation ? (
            <View style={styles.explanationCard}>
              <Text style={styles.explanationHeader}>Simple Explanation</Text>
              <Text style={styles.explanationBody}>{medicine.explanation}</Text>
            </View>
          ) : null}
        </Card>

        {/* Dose Logging Actions */}
        {medicine.isActive && (
          <View style={styles.logDoseSection}>
            <Text style={styles.sectionTitle}>Record Today's Dose</Text>
            <View style={styles.logDoseButtons}>
              <Button
                title="Mark Taken"
                size="md"
                loading={takingDose}
                onPress={() => handleLogDose('TAKEN')}
                icon={<CheckCircle2 size={18} color="#FFFFFF" />}
                style={styles.takeBtn}
              />
              <Button
                title="Skip Dose"
                variant="outline"
                size="md"
                onPress={() => handleLogDose('SKIPPED')}
                icon={<XCircle size={18} color="#0D9488" />}
                style={styles.skipBtn}
              />
            </View>
          </View>
        )}

        {/* Verified Pharmacy Pricing Section (Feature 10) */}
        <View style={styles.pricingSection}>
          <View style={styles.pricingHeader}>
            <Text style={styles.sectionTitle}>Verified Pharmacy Prices</Text>
            <Badge label="Transparent Pricing" variant="blue" />
          </View>

          {priceData.length > 0 ? (
            priceData.map((item) => (
              <Card key={item.id} style={styles.priceCard}>
                <View style={styles.priceLeft}>
                  <Text style={styles.pharmacyName}>{item.pharmacy}</Text>
                  <Text style={styles.priceDosage}>
                    {item.dosage || item.genericName || 'Standard Package'}
                  </Text>
                  <Text style={styles.brandName}>Brand: {item.brand || 'Generic'}</Text>
                </View>
                <View style={styles.priceRight}>
                  <Text style={styles.priceText}>
                    ${item.price.toFixed(2)}
                  </Text>
                  <Badge
                    label={item.inStock ? 'In Stock' : 'Call Pharmacy'}
                    variant={item.inStock ? 'green' : 'amber'}
                  />
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.noPricesCard}>
              <DollarSign size={24} color="#94A3B8" />
              <Text style={styles.noPricesTitle}>No Verified Prices Yet</Text>
              <Text style={styles.noPricesText}>
                No verified retail pharmacy pricing is currently on file for{' '}
                {medicine.name}. We never fabricate medication costs.
              </Text>
            </Card>
          )}
        </View>

        {/* Prescription Reference */}
        {medicine.prescription && (
          <TouchableOpacity
            style={styles.prescriptionRefCard}
            onPress={() =>
              router.push({
                pathname: '/prescription/details',
                params: { id: medicine.prescription.id },
              })
            }
          >
            <FileText size={20} color="#0284C7" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.prescRefTitle}>Prescription Origin</Text>
              <Text style={styles.prescRefSubtitle}>
                {medicine.prescription.doctorName || 'Prescription Record'}
              </Text>
            </View>
            <ChevronRight size={18} color="#0284C7" />
          </TouchableOpacity>
        )}

        {/* Dose History Logs */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Dose History Log</Text>
          {medicine.logs && medicine.logs.length > 0 ? (
            medicine.logs.map((log: any) => (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logLeft}>
                  <CheckCircle2
                    size={16}
                    color={log.status === 'TAKEN' ? '#0D9488' : '#EF4444'}
                  />
                  <Text style={styles.logStatus}>
                    {log.status === 'TAKEN' ? 'Dose Taken' : 'Dose Skipped'}
                  </Text>
                </View>
                <Text style={styles.logDate}>
                  {new Date(log.takenAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noLogsText}>No doses recorded yet.</Text>
          )}
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
  },
  notFound: {
    padding: 30,
    alignItems: 'center',
  },
  mainCard: {
    marginBottom: 20,
    padding: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  medIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  medName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  medDosage: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 1,
  },
  scheduleGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  gridVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  instructionCard: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  instructionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  instructionBody: {
    fontSize: 13,
    color: '#14532D',
    lineHeight: 18,
  },
  explanationCard: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 10,
  },
  explanationHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  explanationBody: {
    fontSize: 13,
    color: '#0C4A6E',
    lineHeight: 18,
  },
  logDoseSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  logDoseButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  takeBtn: {
    flex: 1,
  },
  skipBtn: {
    flex: 1,
  },
  pricingSection: {
    marginBottom: 20,
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
  },
  priceLeft: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  priceDosage: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  brandName: {
    fontSize: 12,
    color: '#0D9488',
    marginTop: 1,
  },
  priceRight: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  noPricesCard: {
    padding: 20,
    alignItems: 'center',
  },
  noPricesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    marginBottom: 4,
  },
  noPricesText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  prescriptionRefCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 20,
  },
  prescRefTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0369A1',
  },
  prescRefSubtitle: {
    fontSize: 12,
    color: '#0284C7',
    marginTop: 1,
  },
  historySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 8,
  },
  logDate: {
    fontSize: 12,
    color: '#64748B',
  },
  noLogsText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 10,
  },
});
