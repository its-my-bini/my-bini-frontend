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

  const applyThemeToDOM = useCallback((t: Theme) => {
    const r = document.documentElement;
    r.setAttribute('data-theme', t.key);
    r.style.setProperty('--c-bg', t.bg);
    r.style.setProperty('--c-secondary', t.secondary);
    r.style.setProperty('--c-secondary-90', t.secondary90);
    r.style.setProperty('--c-secondary-80', t.secondary80);
    r.style.setProperty('--c-secondary-50', t.secondary50);
    r.style.setProperty('--c-secondary-light', t.secondaryLight);
    r.style.setProperty('--c-primary', t.primary);
    r.style.setProperty('--c-primary-hover', t.primaryHover);
    r.style.setProperty('--c-accent', t.accent);
    r.style.setProperty('--c-text-light', t.textLight);
    r.style.setProperty('--c-svg-fill', t.svgFill);
    r.style.setProperty('--c-muted', t.muted);
    r.style.setProperty('--c-muted-dim', t.mutedDim);
    r.style.setProperty('--c-muted-faint', t.mutedFaint);
    r.style.setProperty('--c-border', t.border);
    r.style.setProperty('--c-border-light', t.borderLight);
    r.style.setProperty('--c-border-accent', t.borderAccent);
    r.style.setProperty('--c-hover-bg', t.hoverBg);
    r.style.setProperty('--c-surface', t.surface);
    r.style.setProperty('--c-primary-dim', t.primaryDim);
    r.style.setProperty('--c-primary-faint', t.primaryFaint);
  }, []);

  const setTheme = useCallback((key: ThemeKey) => {
    localStorage.setItem('mybini-theme', key);
    applyThemeToDOM(THEMES[key]);
    emitStorageChange();
  }, [applyThemeToDOM]);

  const setBgPattern = useCallback((key: BgPatternKey) => {
    localStorage.setItem('mybini-bg-pattern', key);
    emitStorageChange();
  }, []);

  const theme = THEMES[themeKey];
  const bgPattern = BG_PATTERNS[bgPatternKey];

  // Apply theme on mount and when themeKey changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme, applyThemeToDOM]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, bgPattern, setBgPattern }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
