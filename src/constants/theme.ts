export interface ThemeColors {
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  background: string;
  card: string;
  surface: string;
  cardDisabled: string;
  border: string;
  borderFocus: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  inputBg: string;
  inputBorder: string;
  error: string;
  errorBg: string;
  errorBorder: string;
  success: string;
  successBg: string;
  successBorder: string;
  warning: string;
  warningBg: string;
  warningBorder: string;
  badgeBg: string;
  badgeText: string;
  shadow: string;

  // Glassmorphism & Liquid Glass Tokens
  glassCard: string;
  glassCardSubtle: string;
  glassBorder: string;
  glassBorderSubtle: string;
  glassHighlight: string;
  glassGlow: string;
  neonCyan: string;
  neonTeal: string;
  neonPurple: string;
  neonPink: string;
  blurTint: 'light' | 'dark';
  gradientBg: [string, string, ...string[]];
  gradientPrimary: [string, string, ...string[]];
  liquidBlobs: [string, string, string];
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    text: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#94A3B8',
    textMuted: '#64748B',
    background: '#F1F5F9',
    card: 'rgba(255, 255, 255, 0.75)',
    surface: 'rgba(255, 255, 255, 0.75)',
    cardDisabled: 'rgba(241, 245, 249, 0.65)',
    border: 'rgba(255, 255, 255, 0.75)',
    borderFocus: '#0284C7',
    primary: '#0D9488',
    primaryLight: 'rgba(13, 148, 136, 0.12)',
    secondary: '#0284C7',
    secondaryLight: 'rgba(2, 132, 199, 0.12)',
    inputBg: 'rgba(255, 255, 255, 0.65)',
    inputBorder: 'rgba(203, 213, 225, 0.7)',
    error: '#EF4444',
    errorBg: 'rgba(254, 242, 242, 0.8)',
    errorBorder: 'rgba(252, 165, 165, 0.8)',
    success: '#10B981',
    successBg: 'rgba(236, 253, 245, 0.8)',
    successBorder: 'rgba(110, 231, 183, 0.8)',
    warning: '#F59E0B',
    warningBg: 'rgba(255, 251, 235, 0.8)',
    warningBorder: 'rgba(252, 211, 77, 0.8)',
    badgeBg: 'rgba(241, 245, 249, 0.75)',
    badgeText: '#334155',
    shadow: '#0F172A',

    // Glass tokens
    glassCard: 'rgba(255, 255, 255, 0.72)',
    glassCardSubtle: 'rgba(255, 255, 255, 0.45)',
    glassBorder: 'rgba(255, 255, 255, 0.85)',
    glassBorderSubtle: 'rgba(226, 232, 240, 0.6)',
    glassHighlight: 'rgba(255, 255, 255, 0.95)',
    glassGlow: 'rgba(13, 148, 136, 0.20)',
    neonCyan: '#0284C7',
    neonTeal: '#0D9488',
    neonPurple: '#7C3AED',
    neonPink: '#DB2777',
    blurTint: 'light',
    gradientBg: ['#EEF2FF', '#E0F2FE', '#F0FDFA'],
    gradientPrimary: ['#0D9488', '#0284C7'],
    liquidBlobs: ['#38BDF8', '#2DD4BF', '#818CF8'],
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    textMuted: '#64748B',
    background: '#070D18',
    card: 'rgba(15, 23, 42, 0.72)',
    surface: 'rgba(15, 23, 42, 0.72)',
    cardDisabled: 'rgba(22, 31, 48, 0.6)',
    border: 'rgba(255, 255, 255, 0.14)',
    borderFocus: '#00F2FE',
    primary: '#14B8A6',
    primaryLight: 'rgba(20, 184, 166, 0.16)',
    secondary: '#38BDF8',
    secondaryLight: 'rgba(56, 189, 248, 0.16)',
    inputBg: 'rgba(15, 23, 42, 0.65)',
    inputBorder: 'rgba(51, 65, 85, 0.7)',
    error: '#F87171',
    errorBg: 'rgba(69, 10, 10, 0.8)',
    errorBorder: 'rgba(127, 29, 29, 0.8)',
    success: '#34D399',
    successBg: 'rgba(6, 78, 59, 0.8)',
    successBorder: 'rgba(6, 95, 70, 0.8)',
    warning: '#FBBF24',
    warningBg: 'rgba(69, 26, 3, 0.8)',
    warningBorder: 'rgba(120, 53, 15, 0.8)',
    badgeBg: 'rgba(30, 41, 59, 0.75)',
    badgeText: '#E2E8F0',
    shadow: '#000000',

    // Glass tokens
    glassCard: 'rgba(15, 23, 42, 0.70)',
    glassCardSubtle: 'rgba(30, 41, 59, 0.45)',
    glassBorder: 'rgba(255, 255, 255, 0.16)',
    glassBorderSubtle: 'rgba(51, 65, 85, 0.5)',
    glassHighlight: 'rgba(255, 255, 255, 0.28)',
    glassGlow: 'rgba(0, 242, 254, 0.25)',
    neonCyan: '#00F2FE',
    neonTeal: '#2DD4BF',
    neonPurple: '#A855F7',
    neonPink: '#F472B6',
    blurTint: 'dark',
    gradientBg: ['#070D18', '#0B1528', '#08101E'],
    gradientPrimary: ['#14B8A6', '#06B6D4'],
    liquidBlobs: ['#00F2FE', '#3B82F6', '#EC4899'],
  },
};

export type ThemeColorKey = keyof ThemeColors;
