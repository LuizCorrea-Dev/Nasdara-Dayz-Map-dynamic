import { AppTheme, ThemeSpacing, ThemeBorderRadius } from './theme.types';

const spacing: ThemeSpacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  huge: '64px',
};

const borderRadius: ThemeBorderRadius = {
  sm: '2px',
  md: '4px',
  lg: '6px',
  xl: '8px',
  full: '9999px',
};

export const lightTheme: AppTheme = {
  mode: 'light',
  spacing,
  borderRadius,
  colors: {
    background: '#FFFFFF',
    surface: '#F3F4F6',
    surfaceVariant: '#E5E7EB',
    surfaceHover: '#E2E8F0',
    border: '#D1D5DB',
    borderFocus: '#B45309',
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    primary: '#B45309', // Warm desert amber/ochre
    primaryHover: '#92400E',
    primaryText: '#FFFFFF',
    secondary: '#047857', // Oasis deep emerald
    secondaryHover: '#065F46',
    secondaryText: '#FFFFFF',
    accent: '#C2410C', // Terracotta
    accentText: '#FFFFFF',
    danger: '#B91C1C',
    dangerSurface: '#FEE2E2',
    dangerText: '#991B1B',
    warning: '#B45309',
    warningSurface: '#FEF3C7',
    warningText: '#92400E',
    success: '#047857',
    successSurface: '#D1FAE5',
    successText: '#065F46',
    military: '#DC2626',
    militarySurface: '#FEE2E2',
    water: '#0284C7',
    waterSurface: '#E0F2FE',
    vehicle: '#D97706',
    vehicleSurface: '#FEF3C7',
    medical: '#059669',
    medicalSurface: '#D1FAE5',
    radio: '#7C3AED',
    radioSurface: '#EDE9FE',
    mapBg: '#E9DEC7', // Desert sand map tone
    mapGrid: '#D5C4A7',
    mapGridText: '#786C5A',
    mapContour: '#D2BF9E',
    mapRoadPrimary: '#6E5339',
    mapRoadSecondary: '#9A8064',
    mapZoneSandstorm: 'rgba(217, 119, 6, 0.22)',
    mapZoneDanger: 'rgba(185, 28, 28, 0.18)',
    overlay: 'rgba(17, 24, 39, 0.65)',
  },
};
