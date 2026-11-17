import { useState, useEffect, useCallback } from 'react';
import type { Theme, Wallpaper, ThemeColor, ThemeColorSetting } from '../types';
import { presetWallpapers } from '../data/wallpapers';
import { presetThemeColors } from '../data/themeColors';
import { getSystemTheme, hexToRgb, getContrastYIQ } from '../lib/utils';

const THEME_KEY = 'quizHeroTheme';
const WALLPAPER_KEY = 'quizHeroWallpaper';
const THEME_COLOR_KEY = 'quizHeroThemeColor';
const SOUND_ENABLED_KEY = 'quizHeroSoundEnabled';

const DEFAULT_THEME_COLOR: ThemeColor = {
  id: 'cyan',
  nameKey: 'color_cyan',
  hex: '#06b6d4',
};

/**
 * Manages theme mode, accent color, wallpaper, and sound preference.
 * Also applies CSS variables for the accent color.
 */
export function useThemeSettings() {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(THEME_KEY) as Theme) || 'auto'
  );
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() =>
    theme === 'auto' ? getSystemTheme() : theme
  );
  const [isSoundEnabled, setIsSoundEnabled] = useState(
    () => localStorage.getItem(SOUND_ENABLED_KEY) !== 'false'
  );
  const [wallpaper, setWallpaperState] = useState<Wallpaper>({
    type: 'default',
    value: '',
  });
  const [themeColor, setThemeColorState] = useState<ThemeColorSetting>({
    type: 'preset',
    value: 'cyan',
  });

  // Load wallpaper + theme color from storage on mount
  useEffect(() => {
    const savedWallpaper = localStorage.getItem(WALLPAPER_KEY);
    if (savedWallpaper) {
      try {
        const parsed = JSON.parse(savedWallpaper);
        setWallpaperState({ type: parsed.type, value: parsed.id_or_uri });
      } catch (e) {
        console.error('Failed to parse wallpaper', e);
      }
    }
    const savedThemeColor = localStorage.getItem(THEME_COLOR_KEY);
    if (savedThemeColor) {
      try {
        setThemeColorState(JSON.parse(savedThemeColor));
      } catch (e) {
        console.error('Failed to parse theme color', e);
      }
    }
  }, []);

  // Sync dark class + persist theme
  useEffect(() => {
    const newEffective = theme === 'auto' ? getSystemTheme() : theme;
    setEffectiveTheme(newEffective);
    document.documentElement.classList.toggle('dark', newEffective === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // React to system theme changes when in auto mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        const newEffective = getSystemTheme();
        setEffectiveTheme(newEffective);
        document.documentElement.classList.toggle('dark', newEffective === 'dark');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply accent color CSS variables
  useEffect(() => {
    let effectiveColor: ThemeColor = DEFAULT_THEME_COLOR;

    if (themeColor.type === 'auto') {
      let accentHex: string | undefined;
      if (wallpaper.type === 'preset') {
        accentHex = presetWallpapers.find((p) => p.id === wallpaper.value)?.accentColor;
      }
      effectiveColor = accentHex
        ? { id: 'auto', nameKey: 'auto_color', hex: accentHex }
        : DEFAULT_THEME_COLOR;
    } else if (themeColor.type === 'preset') {
      effectiveColor =
        presetThemeColors.find((c) => c.id === themeColor.value) || DEFAULT_THEME_COLOR;
    } else if (themeColor.type === 'custom') {
      effectiveColor = { id: 'custom', nameKey: 'custom_color', hex: themeColor.value };
    }

    const contrast = getContrastYIQ(effectiveColor.hex);
    const rgb = hexToRgb(effectiveColor.hex);
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--accent-color', effectiveColor.hex);
    rootStyle.setProperty('--accent-color-contrast', contrast);
    if (rgb) {
      rootStyle.setProperty('--accent-color-rgb', `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`);
    }
  }, [themeColor, wallpaper]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleSound = useCallback((enabled: boolean) => {
    setIsSoundEnabled(enabled);
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  }, []);

  const setWallpaper = useCallback((newWallpaper: Wallpaper) => {
    setWallpaperState(newWallpaper);
    localStorage.setItem(
      WALLPAPER_KEY,
      JSON.stringify({
        type: newWallpaper.type,
        id_or_uri: newWallpaper.value,
        applied_at: Date.now(),
      })
    );
  }, []);

  const setThemeColor = useCallback((newThemeColor: ThemeColorSetting) => {
    setThemeColorState(newThemeColor);
    localStorage.setItem(THEME_COLOR_KEY, JSON.stringify(newThemeColor));
  }, []);

  return {
    theme,
    setTheme,
    effectiveTheme,
    isSoundEnabled,
    toggleSound,
    wallpaper,
    setWallpaper,
    themeColor,
    setThemeColor,
  };
}
