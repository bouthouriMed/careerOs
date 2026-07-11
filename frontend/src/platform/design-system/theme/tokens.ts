export interface AppTheme {
  colors: {
    bg: string;
    sidebarBg: string;
    cardBg: string;
    cardBg2: string;
    panelBg: string;
    border: string;
    borderLight: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentMuted: string;
    accentHover: string;
    primary: string;
    primaryMuted: string;
    success: string;
    warning: string;
    error: string;
    purple: string;
    purpleMuted: string;
    orange: string;
    orangeMuted: string;
    surfaceHover: string;
    scrollbarThumb: string;
    scrollbarThumbHover: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  typography: {
    fontFamily: string;
    fontMono: string;
    sizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    weights: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
}

export const sharedTokens = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: '"JetBrains Mono", monospace',
    sizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '24px',
    xxl: '28px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    xxl: '1600px',
  },
};

export const darkColors: AppTheme['colors'] = {
  bg: '#06080a',
  sidebarBg: '#090C14',
  cardBg: '#10141d',
  cardBg2: '#141925',
  panelBg: '#06080a',
  border: '#1a1f2c',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  text: '#ffffff',
  textSecondary: '#8591a3',
  textMuted: '#4d5765',
  accent: '#00ca72',
  accentMuted: 'rgba(0, 202, 114, 0.08)',
  accentHover: '#00e884',
  primary: '#4F8EF7',
  primaryMuted: 'rgba(79, 142, 247, 0.12)',
  success: '#00ca72',
  warning: '#f97316',
  error: '#f87171',
  purple: '#a855f7',
  purpleMuted: 'rgba(168, 85, 247, 0.12)',
  orange: '#f97316',
  orangeMuted: 'rgba(249, 115, 22, 0.08)',
  surfaceHover: 'rgba(255, 255, 255, 0.04)',
  scrollbarThumb: 'rgba(255, 255, 255, 0.08)',
  scrollbarThumbHover: 'rgba(255, 255, 255, 0.12)',
};

export const lightColors: AppTheme['colors'] = {
  bg: '#f0f2f5',
  sidebarBg: '#ffffff',
  cardBg: '#ffffff',
  cardBg2: '#f8fafc',
  panelBg: '#f8fafc',
  border: '#e2e8f0',
  borderLight: 'rgba(0, 0, 0, 0.06)',
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  accent: '#059669',
  accentMuted: 'rgba(5, 150, 105, 0.08)',
  accentHover: '#047857',
  primary: '#2563EB',
  primaryMuted: 'rgba(37, 99, 235, 0.10)',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  purple: '#7c3aed',
  purpleMuted: 'rgba(124, 58, 237, 0.08)',
  orange: '#ea580c',
  orangeMuted: 'rgba(234, 88, 12, 0.06)',
  surfaceHover: 'rgba(0, 0, 0, 0.03)',
  scrollbarThumb: 'rgba(0, 0, 0, 0.12)',
  scrollbarThumbHover: 'rgba(0, 0, 0, 0.2)',
};

export const darkTheme: AppTheme = {
  colors: darkColors,
  ...sharedTokens,
};

export const lightTheme: AppTheme = {
  colors: lightColors,
  ...sharedTokens,
};
