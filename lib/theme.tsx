'use client';

import { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from 'react';

export type ThemeKey = 'pink' | 'purple' | 'blue' | 'green';

export type BgPatternKey = 'food' | 'bubbles' | 'shapes' | 'none';

export interface BgPattern {
  key: BgPatternKey;
  label: string;
  src: string | null;
  size: string;
}

export const BG_PATTERNS: Record<BgPatternKey, BgPattern> = {
  food: { key: 'food', label: 'Food', src: '/i-like-food.svg', size: '260px 260px' },
  bubbles: { key: 'bubbles', label: 'Bubbles', src: '/bubbles.svg', size: '100px 100px' },
  shapes: { key: 'shapes', label: 'Shapes', src: '/random-shapes.svg', size: '80px 80px' },
  none: { key: 'none', label: 'None', src: null, size: '' },
};

export interface Theme {
  key: ThemeKey;
  label: string;
  emoji: string;
  bg: string;
  secondary: string;
  secondary90: string;
  secondary80: string;
  secondary50: string;
  secondaryLight: string;
  primary: string;
  primaryHover: string;
  accent: string;
  textLight: string;
  svgFill: string;
  rainbowAccent: string;
  muted: string;
  mutedDim: string;
  mutedFaint: string;
  border: string;
  borderLight: string;
  borderAccent: string;
  hoverBg: string;
  surface: string;
  primaryDim: string;
  primaryFaint: string;
}

export const THEMES: Record<ThemeKey, Theme> = {
  pink: {
    key: 'pink',
    label: 'Rose',
    emoji: '🌸',
    bg: '#1a0a14',
    secondary: '#2d1525',
    secondary90: 'rgba(45,21,37,0.9)',
    secondary80: 'rgba(45,21,37,0.8)',
    secondary50: 'rgba(45,21,37,0.5)',
    secondaryLight: '#3d2133',
    primary: '#ec4899',
    primaryHover: '#db2777',
    accent: '#f472b6',
    textLight: '#fce7f3',
    svgFill: '#3d1a2e',
    rainbowAccent: '#ec4899',
    muted: 'rgba(249,168,212,0.8)',
    mutedDim: 'rgba(249,168,212,0.6)',
    mutedFaint: 'rgba(249,168,212,0.5)',
    border: 'rgba(131,24,67,0.6)',
    borderLight: 'rgba(131,24,67,0.5)',
    borderAccent: 'rgba(236,72,153,0.6)',
    hoverBg: 'rgba(131,24,67,0.5)',
    surface: 'rgba(131,24,67,0.4)',
    primaryDim: 'rgba(236,72,153,0.25)',
    primaryFaint: 'rgba(236,72,153,0.15)',
  },
  purple: {
    key: 'purple',
    label: 'Lavender',
    emoji: '💜',
    bg: '#0f0a1a',
    secondary: '#1e1530',
    secondary90: 'rgba(30,21,48,0.9)',
    secondary80: 'rgba(30,21,48,0.8)',
    secondary50: 'rgba(30,21,48,0.5)',
    secondaryLight: '#2d2045',
    primary: '#a855f7',
    primaryHover: '#9333ea',
    accent: '#c084fc',
    textLight: '#f3e8ff',
    svgFill: '#2a1d45',
    rainbowAccent: '#a855f7',
    muted: 'rgba(216,180,254,0.7)',
    mutedDim: 'rgba(216,180,254,0.5)',
    mutedFaint: 'rgba(216,180,254,0.4)',
    border: 'rgba(88,28,135,0.4)',
    borderLight: 'rgba(88,28,135,0.3)',
    borderAccent: 'rgba(168,85,247,0.5)',
    hoverBg: 'rgba(88,28,135,0.4)',
    surface: 'rgba(88,28,135,0.3)',
    primaryDim: 'rgba(168,85,247,0.2)',
    primaryFaint: 'rgba(168,85,247,0.1)',
  },
  blue: {
    key: 'blue',
    label: 'Ocean',
    emoji: '🌊',
    bg: '#0a1019',
    secondary: '#152030',
    secondary90: 'rgba(21,32,48,0.9)',
    secondary80: 'rgba(21,32,48,0.8)',
    secondary50: 'rgba(21,32,48,0.5)',
    secondaryLight: '#1e2d45',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    accent: '#60a5fa',
    textLight: '#dbeafe',
    svgFill: '#1a2d45',
    rainbowAccent: '#3b82f6',
    muted: 'rgba(147,197,253,0.7)',
    mutedDim: 'rgba(147,197,253,0.5)',
    mutedFaint: 'rgba(147,197,253,0.4)',
    border: 'rgba(30,58,138,0.4)',
    borderLight: 'rgba(30,58,138,0.3)',
    borderAccent: 'rgba(59,130,246,0.5)',
    hoverBg: 'rgba(30,58,138,0.4)',
    surface: 'rgba(30,58,138,0.3)',
    primaryDim: 'rgba(59,130,246,0.2)',
    primaryFaint: 'rgba(59,130,246,0.1)',
  },
  green: {
    key: 'green',
    label: 'Mint',
    emoji: '🌿',
    bg: '#0a1410',
    secondary: '#152d20',
    secondary90: 'rgba(21,45,32,0.9)',
    secondary80: 'rgba(21,45,32,0.8)',
    secondary50: 'rgba(21,45,32,0.5)',
    secondaryLight: '#1e3d2e',
    primary: '#10b981',
    primaryHover: '#059669',
    accent: '#34d399',
    textLight: '#d1fae5',
    svgFill: '#1a3d2a',
    rainbowAccent: '#10b981',
    muted: 'rgba(110,231,183,0.7)',
    mutedDim: 'rgba(110,231,183,0.5)',
    mutedFaint: 'rgba(110,231,183,0.4)',
    border: 'rgba(6,78,59,0.4)',
    borderLight: 'rgba(6,78,59,0.3)',
    borderAccent: 'rgba(16,185,129,0.5)',
    hoverBg: 'rgba(6,78,59,0.4)',
    surface: 'rgba(6,78,59,0.3)',
    primaryDim: 'rgba(16,185,129,0.2)',
    primaryFaint: 'rgba(16,185,129,0.1)',
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (key: ThemeKey) => void;
  bgPattern: BgPattern;
  setBgPattern: (key: BgPatternKey) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES.pink,
  setTheme: () => {},
  bgPattern: BG_PATTERNS.food,
  setBgPattern: () => {},
});

// Pub/sub for same-tab localStorage reactivity
const storageListeners = new Set<() => void>();
function emitStorageChange() {
  storageListeners.forEach((cb) => cb());
}
function subscribeStorage(callback: () => void) {
  storageListeners.add(callback);
  return () => { storageListeners.delete(callback); };
}

function getThemeSnapshot(): ThemeKey {
  const v = localStorage.getItem('mybini-theme');
  return v !== null && v in THEMES ? (v as ThemeKey) : 'pink';
}
function getThemeServerSnapshot(): ThemeKey {
  return 'pink';
}

function getBgSnapshot(): BgPatternKey {
  const v = localStorage.getItem('mybini-bg-pattern');
  return v !== null && v in BG_PATTERNS ? (v as BgPatternKey) : 'food';
}
function getBgServerSnapshot(): BgPatternKey {
  return 'food';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeKey = useSyncExternalStore(subscribeStorage, getThemeSnapshot, getThemeServerSnapshot);
  const bgPatternKey = useSyncExternalStore(subscribeStorage, getBgSnapshot, getBgServerSnapshot);

  const setTheme = useCallback((key: ThemeKey) => {
    localStorage.setItem('mybini-theme', key);
    emitStorageChange();
  }, []);

  const setBgPattern = useCallback((key: BgPatternKey) => {
    localStorage.setItem('mybini-bg-pattern', key);
    emitStorageChange();
  }, []);

  const theme = THEMES[themeKey];
  const bgPattern = BG_PATTERNS[bgPatternKey];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--c-bg', theme.bg);
    root.style.setProperty('--c-secondary', theme.secondary);
    root.style.setProperty('--c-secondary-90', theme.secondary90);
    root.style.setProperty('--c-secondary-80', theme.secondary80);
    root.style.setProperty('--c-secondary-50', theme.secondary50);
    root.style.setProperty('--c-secondary-light', theme.secondaryLight);
    root.style.setProperty('--c-primary', theme.primary);
    root.style.setProperty('--c-primary-hover', theme.primaryHover);
    root.style.setProperty('--c-accent', theme.accent);
    root.style.setProperty('--c-muted', theme.muted);
    root.style.setProperty('--c-muted-dim', theme.mutedDim);
    root.style.setProperty('--c-muted-faint', theme.mutedFaint);
    root.style.setProperty('--c-border', theme.border);
    root.style.setProperty('--c-border-light', theme.borderLight);
    root.style.setProperty('--c-border-accent', theme.borderAccent);
    root.style.setProperty('--c-hover-bg', theme.hoverBg);
    root.style.setProperty('--c-surface', theme.surface);
    root.style.setProperty('--c-primary-dim', theme.primaryDim);
    root.style.setProperty('--c-primary-faint', theme.primaryFaint);
    root.style.setProperty('--c-text-light', theme.textLight);
    root.style.setProperty('--c-svg-fill', theme.svgFill);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, bgPattern, setBgPattern }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
