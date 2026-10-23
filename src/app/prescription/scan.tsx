import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
} from 'lucide-react-native';
import { api } from '../../services/api';
import { useTheme } from '../../hooks/use-theme';
import { useTranslation } from '../../context/LocalizationContext';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Loading } from '../../components/Loading';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { LiquidBackground } from '../../components/LiquidBackground';

export default function PrescriptionScanScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('scan.permissionRequired'),
          t('scan.cameraPermission')
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Could not launch camera.');
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('scan.permissionRequired'),
          t('scan.galleryPermission')
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || 'Could not pick image from gallery.');
    }
  };

  const analyzePrescription = async () => {
    if (!selectedImage) return;

    try {
      setAnalyzing(true);
      setAnalysisStatus(t('scan.uploading'));

      // Build multipart/form-data
      const formData = new FormData();
      const filename = selectedImage.split('/').pop() || 'prescription.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      if (Platform.OS === 'web') {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        formData.append('prescriptionImage', blob, filename);
      } else {
        formData.append('prescriptionImage', {
          uri: selectedImage,
          name: filename,
          type,
        } as any);
      }

      setAnalysisStatus(t('scan.analyzing'));

      const res = await api.post('/ai/analyze-prescription', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000,
      });

      const analysisData = res.data.data;

      // Navigate to result review screen with extracted payload
      router.push({
        pathname: '/prescription/result',
        params: {
          analysis: JSON.stringify(analysisData),
          imageUri: selectedImage,
        },
      });
    } catch (err: any) {
      Alert.alert(
        t('common.error'),
        err.message ||
          'Failed to analyze the prescription. Please ensure the image is clear and try again.'
      );
    } finally {
      setAnalyzing(false);
      setAnalysisStatus(null);
    }
  };

  return (
    <LiquidBackground>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title={t('scan.title')}
          subtitle={t('scan.subheading')}
          showBack
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
        <DisclaimerBanner />

        {analyzing ? (
          <View style={styles.analyzingContainer}>
            <Loading message={analysisStatus || t('scan.analyzing')} />
            <Text style={[styles.analyzingSubtext, { color: colors.textSecondary }]}>
              {t('scan.analyzing')}
            </Text>
          </View>
        ) : selectedImage ? (
          <View style={styles.previewContainer}>
            <Text style={[styles.previewLabel, { color: colors.text }]}>
              {t('prescriptions.title')}
            </Text>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.retakeRow}>
              <TouchableOpacity
                style={[
                  styles.retakeBtn,
                  {
                    backgroundColor: isDark
                      ? 'rgba(13, 148, 136, 0.2)'
                      : '#F0FDFA',
                    borderColor: isDark ? '#134E4A' : '#CCFBF1',
                  },
                ]}
                onPress={takePhoto}
              >
                <RefreshCw size={16} color={colors.primary} />
                <Text style={[styles.retakeBtnText, { color: colors.primary }]}>
                  {t('scan.retake')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.retakeBtn,
                  {
                    backgroundColor: isDark
                      ? 'rgba(13, 148, 136, 0.2)'
                      : '#F0FDFA',
                    borderColor: isDark ? '#134E4A' : '#CCFBF1',
                  },
                ]}
                onPress={pickImage}
              >
                <ImageIcon size={16} color={colors.primary} />
                <Text style={[styles.retakeBtnText, { color: colors.primary }]}>
                  {t('scan.uploadGallery')}
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title={t('scan.analyze')}
              size="lg"
              onPress={analyzePrescription}
              iconRight={<Sparkles size={18} color="#FFFFFF" />}
              style={styles.processBtn}
            />
          </View>
        ) : (
          <View style={styles.pickerSection}>
            <View
              style={[
                styles.guidelinesCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.guidelineTitle, { color: colors.text }]}>
                {t('scan.instructionsTitle')}
              </Text>
              <Text style={[styles.guidelineItem, { color: colors.textSecondary }]}>
                • {t('scan.instruction1')}
              </Text>
              <Text style={[styles.guidelineItem, { color: colors.textSecondary }]}>
                • {t('scan.instruction2')}
              </Text>
              <Text style={[styles.guidelineItem, { color: colors.textSecondary }]}>
                • {t('scan.instruction3')}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.choiceCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={takePhoto}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.choiceIcon,
                  {
                    backgroundColor: isDark
                      ? 'rgba(13, 148, 136, 0.2)'
                      : '#F0FDFA',
                  },
                ]}
              >
                <Camera size={28} color={colors.primary} />
              </View>
              <View style={styles.choiceTextContainer}>
                <Text style={[styles.choiceTitle, { color: colors.text }]}>
                  {t('scan.takePhoto')}
                </Text>
                <Text style={[styles.choiceSubtitle, { color: colors.textSecondary }]}>
                  {t('scan.takePhotoDesc')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.choiceCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.choiceIcon,
                  {
                    backgroundColor: isDark
                      ? 'rgba(2, 132, 199, 0.2)'
                      : '#E0F2FE',
                  },
                ]}
              >
                <ImageIcon size={28} color="#0284C7" />
              </View>
              <View style={styles.choiceTextContainer}>
                <Text style={[styles.choiceTitle, { color: colors.text }]}>
                  {t('scan.uploadGallery')}
                </Text>
                <Text style={[styles.choiceSubtitle, { color: colors.textSecondary }]}>
                  {t('scan.uploadGalleryDesc')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  </LiquidBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  analyzingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingSubtext: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 280,
    lineHeight: 18,
  },
  pickerSection: {
    marginTop: 10,
  },
  guidelinesCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  guidelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  guidelineItem: {
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },
  choiceCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  choiceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  choiceTextContainer: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  choiceSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  previewContainer: {
    marginTop: 10,
  },
  previewLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  imageWrapper: {
    width: '100%',
    height: 320,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  retakeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  retakeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  processBtn: {
    width: '100%',
  },
});
