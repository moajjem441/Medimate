import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ShieldAlert,
  Users,
  FileText,
  Pill,
  Bell,
  DollarSign,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Loading } from '../../components/Loading';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [metrics, setMetrics] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [pricesList, setPricesList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'prices'>('metrics');

  const [loading, setLoading] = useState(true);

  // New price state
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [priceMedName, setPriceMedName] = useState('');
  const [pricePharmacy, setPricePharmacy] = useState('');
  const [priceValue, setPriceValue] = useState('');
  const [priceDosage, setPriceDosage] = useState('');
  const [creatingPrice, setCreatingPrice] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert(
        'Access Denied',
        'You must have administrator credentials to access this clinical dashboard.'
      );
      router.replace('/(tabs)');
      return;
    }
    loadAdminData();
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [mRes, uRes, pRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/users'),
        api.get('/prices'),
      ]);

      setMetrics(mRes.data.data?.stats);
      setUsersList(uRes.data.data || []);
      setPricesList(pRes.data.data || []);
    } catch (err: any) {
      Alert.alert('Admin Error', err.message || 'Failed to fetch admin metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrice = async () => {
    if (!priceMedName.trim() || !pricePharmacy.trim() || !priceValue.trim()) {
      Alert.alert('Required Fields', 'Please fill in medicine name, pharmacy, and price.');
      return;
    }

    const numericPrice = parseFloat(priceValue);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid positive numeric price.');
      return;
    }

    try {
      setCreatingPrice(true);
      await api.post('/admin/prices', {
        medicineName: priceMedName.trim(),
        pharmacy: pricePharmacy.trim(),
        price: numericPrice,
        dosage: priceDosage.trim() || undefined,
        inStock: true,
      });

      Alert.alert('Created', 'Verified pharmacy price recorded.');
      setPriceMedName('');
      setPricePharmacy('');
      setPriceValue('');
      setPriceDosage('');
      setShowAddPrice(false);
      loadAdminData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add price record.');
    } finally {
      setCreatingPrice(false);
    }
  };

  const handleDeletePrice = (id: string, name: string) => {
    Alert.alert('Delete Price', `Remove pricing entry for ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/prices/${id}`);
            loadAdminData();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete price.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <Loading fullScreen message="Authenticating administrator access..." />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Admin Portal"
        subtitle="System Metrics & Clinical Catalog"
        showBack
      />

      {/* Admin Tab Selector */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'metrics' && styles.tabBtnActive]}
          onPress={() => setActiveTab('metrics')}
        >
          <Text
            style={[styles.tabText, activeTab === 'metrics' && styles.tabTextActive]}
          >
            Metrics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'users' && styles.tabBtnActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text
            style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}
          >
            Users ({usersList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'prices' && styles.tabBtnActive]}
          onPress={() => setActiveTab('prices')}
        >
          <Text
            style={[styles.tabText, activeTab === 'prices' && styles.tabTextActive]}
          >
            Prices ({pricesList.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* TAB 1: METRICS */}
        {activeTab === 'metrics' && (
          <View>
            <Text style={styles.sectionTitle}>System Statistics</Text>
            <View style={styles.metricsGrid}>
              <Card style={styles.metricCard}>
                <Users size={24} color="#0D9488" />
                <Text style={styles.metricVal}>{metrics?.totalUsers ?? 0}</Text>
                <Text style={styles.metricLabel}>Total Patients</Text>
              </Card>

              <Card style={styles.metricCard}>
                <FileText size={24} color="#0284C7" />
                <Text style={styles.metricVal}>
                  {metrics?.totalPrescriptions ?? 0}
                </Text>
                <Text style={styles.metricLabel}>Prescriptions</Text>
              </Card>

              <Card style={styles.metricCard}>
                <Pill size={24} color="#10B981" />
                <Text style={styles.metricVal}>{metrics?.totalMedicines ?? 0}</Text>
                <Text style={styles.metricLabel}>Active Meds</Text>
              </Card>

              <Card style={styles.metricCard}>
                <Bell size={24} color="#F59E0B" />
                <Text style={styles.metricVal}>{metrics?.totalReminders ?? 0}</Text>
                <Text style={styles.metricLabel}>Alarms Set</Text>
              </Card>
            </View>

            <Card style={styles.roleNoticeCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Lock size={18} color="#0D9488" />
                <Text style={styles.roleNoticeTitle}>Protected Authorization</Text>
              </View>
              <Text style={styles.roleNoticeText}>
                Role-based access control is actively enforced by the backend server
                via requireAdmin middleware on all administrative endpoints.
              </Text>
            </Card>
          </View>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <View>
            <Text style={styles.sectionTitle}>Registered Patient Accounts</Text>
            {usersList.map((u) => (
              <Card key={u.id} style={styles.userItemCard}>
                <View style={styles.userTop}>
                  <Text style={styles.userItemName}>{u.name}</Text>
                  <Badge
                    label={u.role}
                    variant={u.role === 'ADMIN' ? 'blue' : 'teal'}
                  />
                </View>
                <Text style={styles.userItemEmail}>{u.email}</Text>
                <View style={styles.userStatsRow}>
                  <Text style={styles.userStatText}>
                    💊 {u._count?.medicines || 0} Medicines
                  </Text>
                  <Text style={styles.userStatText}>
                    📄 {u._count?.prescriptions || 0} Prescriptions
                  </Text>
                  <Text style={styles.userStatText}>
                    ⏰ {u._count?.reminders || 0} Reminders
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* TAB 3: PHARMACY PRICES */}
        {activeTab === 'prices' && (
          <View>
            <View style={styles.priceHeaderRow}>
              <Text style={styles.sectionTitle}>Verified Pharmacy Prices</Text>
              <Button
                title={showAddPrice ? 'Close Form' : '+ Add Price'}
                size="sm"
                variant={showAddPrice ? 'outline' : 'primary'}
                onPress={() => setShowAddPrice(!showAddPrice)}
              />
            </View>

            {showAddPrice && (
              <Card style={styles.addPriceForm}>
                <Text style={styles.formTitle}>Add Verified Price Benchmark</Text>
                <Input
                  label="Medicine Name"
                  placeholder="e.g. Amoxicillin"
                  value={priceMedName}
                  onChangeText={setPriceMedName}
                />
                <Input
                  label="Pharmacy Name"
                  placeholder="e.g. Walgreens, CVS"
                  value={pricePharmacy}
                  onChangeText={setPricePharmacy}
                />
                <Input
                  label="Price ($ USD)"
                  placeholder="e.g. 12.50"
                  value={priceValue}
                  onChangeText={setPriceValue}
                  keyboardType="decimal-pad"
                />
                <Input
                  label="Dosage / Packaging"
                  placeholder="e.g. 500 mg (21 capsules)"
                  value={priceDosage}
                  onChangeText={setPriceDosage}
                />
                <Button
                  title="Save Price Entry"
                  loading={creatingPrice}
                  onPress={handleCreatePrice}
                />
              </Card>
            )}

            {pricesList.map((p) => (
              <Card key={p.id} style={styles.priceRowCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.priceRowMed}>{p.medicineName}</Text>
                  <Text style={styles.priceRowPharmacy}>
                    {p.pharmacy} • {p.dosage || 'Standard Unit'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                  <Text style={styles.priceRowAmount}>
                    ${p.price.toFixed(2)}
                  </Text>
                  <Badge
                    label={p.inStock ? 'In Stock' : 'Out of Stock'}
                    variant={p.inStock ? 'green' : 'amber'}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => handleDeletePrice(p.id, p.medicineName)}
                  style={{ padding: 4 }}
                >
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#F0FDFA',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0D9488',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
  },
  metricVal: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  roleNoticeCard: {
    padding: 16,
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
  },
  roleNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
    marginLeft: 6,
  },
  roleNoticeText: {
    fontSize: 12,
    color: '#134E4A',
    marginTop: 4,
    lineHeight: 18,
  },
  userItemCard: {
    marginBottom: 12,
    padding: 16,
  },
  userTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  userItemEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
  },
  userStatsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  userStatText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  priceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  addPriceForm: {
    padding: 18,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  priceRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
  },
  priceRowMed: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  priceRowPharmacy: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  priceRowAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
});
