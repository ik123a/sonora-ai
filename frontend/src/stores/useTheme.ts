import { create } from 'zustand';

interface ThemeState { theme: 'dark' | 'light' | 'system'; setTheme: (t: ThemeState['theme']) => void; }

function applyTheme(t: ThemeState['theme']): void {
  const root = document.documentElement;
  const resolved = t === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : t;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

export const useTheme = create<ThemeState>((set) => ({
  theme: 'dark',
  setTheme: (theme) => { applyTheme(theme); set({ theme }); },
}));
