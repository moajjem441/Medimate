import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { api } from '../../services/api';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your account email.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#0D9488" />
          <Text style={styles.backText}>Back to Sign In</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the email address associated with your MediMate account
          </Text>
        </View>

        {sent ? (
          <View style={styles.successCard}>
            <CheckCircle2 size={48} color="#0D9488" />
            <Text style={styles.successTitle}>Check Your Inbox</Text>
            <Text style={styles.successMessage}>
              If an account is associated with {email}, we've sent instructions to
              reset your password.
            </Text>
            <Button
              title="Return to Login"
              onPress={() => router.replace('/(auth)/login')}
              style={styles.returnBtn}
            />
          </View>
        ) : (
          <View style={styles.formCard}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Account Email"
              placeholder="e.g. user@medimate.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color="#64748B" />}
            />

            <Button
              title="Send Reset Instructions"
              size="lg"
              loading={loading}
              onPress={handleSubmit}
            />
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    flexGrow: 1,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
    marginLeft: 6,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
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
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  returnBtn: {
    minWidth: 180,
  },
});
