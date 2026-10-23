import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/LocalizationContext';

interface DisclaimerBannerProps {
  type?: 'disclaimer' | 'warning';
  title?: string;
  message?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  type = 'disclaimer',
  title,
  message,
}) => {
  const isWarning = type === 'warning';
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const displayTitle =
    title ||
    (isWarning
      ? t('disclaimer.cautionTitle')
      : t('disclaimer.noticeTitle'));

  const displayMessage =
    message ||
    (isWarning
      ? t('disclaimer.warningMessage')
      : t('disclaimer.defaultMessage'));

  return (
    <View
      style={[
        styles.banner,
        {
          borderColor: isWarning ? colors.warningBorder : colors.glassBorder,
          borderTopColor: isWarning ? colors.warningBorder : colors.glassHighlight,
        },
      ]}
    >
      <BlurView
        intensity={isDark ? 45 : 30}
        tint={colors.blurTint}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isWarning ? colors.warningBg : colors.primaryLight,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          {isWarning ? (
            <AlertTriangle size={20} color={colors.warning} />
          ) : (
            <ShieldCheck size={20} color={colors.primary} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: isWarning ? colors.warning : colors.primary },
            ]}
          >
            {displayTitle}
          </Text>
          <Text
            style={[
              styles.message,
              { color: isDark ? colors.textSecondary : isWarning ? '#78350F' : '#134E4A' },
            ]}
          >
            {displayMessage}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderRadius: 18,
    borderWidth: 1,
    borderTopWidth: 1.5,
    marginVertical: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  overlay: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 1,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  message: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
});
