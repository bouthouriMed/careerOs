import { tokens } from './tokens';

export const lightTheme = {
  colors: {
    primary: tokens.colors.primary,
    primaryHover: tokens.colors.primaryHover,
    secondary: tokens.colors.secondary,
    secondaryHover: tokens.colors.secondaryHover,
    success: tokens.colors.success,
    warning: tokens.colors.warning,
    error: tokens.colors.error,
    ghost: tokens.colors.ghost,
    ghostHover: tokens.colors.ghostHover,
    background: tokens.colors.background,
    surface: tokens.colors.surface,
    border: tokens.colors.border,
    text: tokens.colors.text,
    textSecondary: tokens.colors.textSecondary,
    textInverse: tokens.colors.textInverse,
  },
  spacing: tokens.spacing,
  typography: tokens.typography,
  borderRadius: tokens.borderRadius,
  shadows: tokens.shadows,
  breakpoints: tokens.breakpoints,
};

export type Theme = typeof lightTheme;
