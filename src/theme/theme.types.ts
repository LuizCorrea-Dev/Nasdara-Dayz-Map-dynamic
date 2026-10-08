// Theme definitions and TypeScript interfaces
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceHover: string;
  border: string;
  borderFocus: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  primaryText: string;
  secondary: string;
  secondaryHover: string;
  secondaryText: string;
  accent: string;
  accentText: string;
  danger: string;
  dangerSurface: string;
  dangerText: string;
  warning: string;
  warningSurface: string;
  warningText: string;
  success: string;
  successSurface: string;
  successText: string;
  military: string;
  militarySurface: string;
  water: string;
  waterSurface: string;
  vehicle: string;
  vehicleSurface: string;
  medical: string;
  medicalSurface: string;
  radio: string;
  radioSurface: string;
  mapBg: string;
  mapGrid: string;
  mapGridText: string;
  mapContour: string;
  mapRoadPrimary: string;
  mapRoadSecondary: string;
  mapZoneSandstorm: string;
  mapZoneDanger: string;
  overlay: string;
}

export interface ThemeSpacing {
  xs: string; // 4px
  sm: string; // 8px
  md: string; // 16px
  lg: string; // 24px
  xl: string; // 32px
  xxl: string; // 48px
  huge: string; // 64px
}

export interface ThemeBorderRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface AppTheme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
}
