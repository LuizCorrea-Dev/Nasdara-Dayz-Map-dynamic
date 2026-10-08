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

export const darkTheme: AppTheme = {
  mode: 'dark',
  spacing,
  borderRadius,
  colors: {
    background: '#0c0b0b', // DayZ deep military graphite
    surface: '#141313', // DayZ UI panel dark charcoal
    surfaceVariant: '#1a1818',
    surfaceHover: '#242121',
    border: '#262424', // DayZ rugged border
    borderFocus: '#8b1e1e', // DayZ signature crimson active border
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    primary: '#8b1e1e', // DayZ signature dark crimson
    primaryHover: '#b91c1c',
    primaryText: '#FFFFFF',
    secondary: '#15803d', // Military camo green
    secondaryHover: '#16a34a',
    secondaryText: '#FFFFFF',
    accent: '#d97706', // DayZ amber survival accent
    accentText: '#FFFFFF',
    danger: '#ef4444',
    dangerSurface: '#3f171a',
    dangerText: '#fecaca',
    warning: '#f59e0b',
    warningSurface: '#3b2912',
    warningText: '#fef3c7',
    success: '#10b981',
    successSurface: '#123826',
    successText: '#d1fae5',
    military: '#dc2626',
    militarySurface: '#451010',
    water: '#0284c7',
    waterSurface: '#082f49',
    vehicle: '#eab308',
    vehicleSurface: '#422006',
    medical: '#059669',
    medicalSurface: '#064e3b',
    radio: '#7c3aed',
    radioSurface: '#2e1065',
    mapBg: '#0e1117',
    mapGrid: '#262d3d',
    mapGridText: '#64748b',
    mapContour: '#192437',
    mapRoadPrimary: '#8a775c',
    mapRoadSecondary: '#544636',
    mapZoneSandstorm: 'rgba(217, 119, 6, 0.25)',
    mapZoneDanger: 'rgba(220, 38, 38, 0.3)',
    overlay: 'rgba(5, 5, 5, 0.85)',
  },
};
