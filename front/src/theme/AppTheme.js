import React, { createContext, useContext } from 'react';
import { DefaultTheme } from '@react-navigation/native';

const colors = {
  background: '#EDEDE8',
  surface: '#FFFDF9',
  metricsBackground: '#E3DED6',
  text: '#1E2A4A',
  muted: '#667085',
  primary: '#0C2D75',
  primarySoft: '#DCE7F6',
  accent: '#79AEEB',
  border: '#D8E1EE',
  success: '#176F5B',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

const radius = {
  sm: 12,
  md: 18,
  lg: 28,
  round: 999,
};

const typography = {
  title: 34,
  subtitle: 16,
  body: 14,
};

export const appTheme = {
  colors,
  spacing,
  radius,
  typography,
};

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
    notification: colors.accent,
  },
};

const ThemeContext = createContext(appTheme);

export function AppThemeProvider({ children }) {
  return <ThemeContext.Provider value={appTheme}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}