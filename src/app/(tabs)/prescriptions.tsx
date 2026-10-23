import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { FileText, Camera } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../services/api';
import { useTheme } from '../../hooks/use-theme';
import { useTranslation } from '../../context/LocalizationContext';
import { Header } from '../../components/Header';
import { PrescriptionCard, PrescriptionData } from '../../components/PrescriptionCard';
import { EmptyState } from '../../components/EmptyState';
import { Loading } from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import { LiquidBackground } from '../../components/LiquidBackground';

export default function PrescriptionsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPrescriptions = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/prescriptions');
      setPrescriptions(res.data.data || []);
    } catch (err: any) {
      console.warn('Failed to load prescriptions:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPrescriptions();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPrescriptions();
  };

  if (loading && !refreshing) {
    return <Loading fullScreen message={t('common.loading')} />;
  }

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <Header
          title={t('prescriptions.title')}
          subtitle={`${prescriptions.length} ${t('prescriptions.subtitle')}`}
          rightAction={
            <TouchableOpacity
              style={styles.scanHeaderBtn}
              onPress={() => router.push('/prescription/scan')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Camera size={16} color="#FFFFFF" />
              <Text style={styles.scanHeaderBtnText}>{t('prescriptions.scanNew')}</Text>
            </TouchableOpacity>
          }
        />

        <FlatList
          data={prescriptions}
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
            <PrescriptionCard
              prescription={item}
              onPress={() =>
                router.push({
                  pathname: '/prescription/details',
                  params: { id: item.id },
                })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<FileText size={32} color={colors.primary} />}
              title={t('prescriptions.noPrescriptions')}
              description={t('prescriptions.noPrescriptionsDesc')}
              actionTitle={t('prescriptions.scanFirst')}
              onAction={() => router.push('/prescription/scan')}
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
  scanHeaderBtn: {
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
  scanHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
});
