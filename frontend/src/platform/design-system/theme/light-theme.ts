import { tokens } from './tokens';

export const lightTheme = {
  colors: {
    ...tokens.colors,
  },
  spacing: tokens.spacing,
  typography: tokens.typography,
  borderRadius: tokens.borderRadius,
  shadows: tokens.shadows,
  breakpoints: tokens.breakpoints,
};

export type Theme = typeof lightTheme;
