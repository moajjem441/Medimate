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
import { Pill, Plus, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { api } from '../../services/api';
import { useTheme } from '../../hooks/use-theme';
import { useTranslation } from '../../context/LocalizationContext';
import { Header } from '../../components/Header';
import { MedicineCard, MedicineData } from '../../components/MedicineCard';
import { EmptyState } from '../../components/EmptyState';
import { Loading } from '../../components/Loading';
import { Input } from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { LiquidBackground } from '../../components/LiquidBackground';

export default function MedicinesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [medicines, setMedicines] = useState<MedicineData[]>([]);
  const [filterActive, setFilterActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [takingDoseId, setTakingDoseId] = useState<string | null>(null);

  const loadMedicines = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const url = filterActive ? '/medicines?active=true' : '/medicines';
      const res = await api.get(url);
      setMedicines(res.data.data || []);
    } catch (err: any) {
      console.warn('Error loading medicines:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMedicines();
    }, [filterActive])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadMedicines();
  };

  const handleTakeDose = async (medicineId: string) => {
    try {
      setTakingDoseId(medicineId);
      await api.post(`/medicines/${medicineId}/log`, {
        status: 'TAKEN',
        notes: 'Logged from medicines tab',
      });
      Alert.alert(t('home.doseTaken'), t('home.doseRecordedAlert'));
      loadMedicines();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Failed to record dose.');
    } finally {
      setTakingDoseId(null);
    }
  };

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.dosage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !refreshing) {
    return <Loading fullScreen message={t('common.loading')} />;
  }

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <Header
          title={t('medicines.title')}
          subtitle={`${medicines.length} ${t('medicines.subtitle')}`}
          rightAction={
            <TouchableOpacity
              style={styles.addHeaderBtn}
              onPress={() => router.push('/medicine/add')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.addHeaderBtnText}>{t('medicines.addNew')}</Text>
            </TouchableOpacity>
          }
        />

        <View
          style={[
            styles.filterSection,
            {
              backgroundColor: colors.glassCard,
              borderColor: colors.glassBorder,
              borderTopColor: colors.glassHighlight,
            },
          ]}
        >
          <BlurView
            intensity={isDark ? 50 : 35}
            tint={colors.blurTint}
            style={StyleSheet.absoluteFill}
          />

          {/* Search Input */}
          <Input
            placeholder={t('medicines.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={16} color={colors.textMuted} />}
            style={styles.searchInput}
          />

          {/* Filter Toggle Buttons */}
          <View
            style={[
              styles.toggleRow,
              {
                backgroundColor: colors.glassCardSubtle,
                borderColor: colors.glassBorderSubtle,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                filterActive && [
                  styles.toggleBtnActive,
                  { backgroundColor: colors.primary },
                ],
              ]}
              onPress={() => setFilterActive(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  {
                    color: filterActive ? '#FFFFFF' : colors.textSecondary,
                    fontWeight: filterActive ? '800' : '600',
                  },
                ]}
              >
                {t('medicines.filterActive')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                !filterActive && [
                  styles.toggleBtnActive,
                  { backgroundColor: colors.primary },
                ],
              ]}
              onPress={() => setFilterActive(false)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  {
                    color: !filterActive ? '#FFFFFF' : colors.textSecondary,
                    fontWeight: !filterActive ? '800' : '600',
                  },
                ]}
              >
                {t('medicines.filterAll')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={filteredMedicines}
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
            <MedicineCard
              medicine={item}
              onPress={() => router.push(`/medicine/${item.id}` as any)}
              onTakeDose={() => handleTakeDose(item.id)}
              isTaking={takingDoseId === item.id}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<Pill size={32} color={colors.primary} />}
              title={t('medicines.noMedicines')}
              description={t('medicines.noMedicinesDesc')}
              actionTitle={searchQuery ? t('common.cancel') : t('medicines.addNew')}
              onAction={
                searchQuery
                  ? () => setSearchQuery('')
                  : () => router.push('/medicine/add')
              }
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
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  searchInput: {
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 13,
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
