
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

export interface ScoringRules {
  correct: number;
  incorrect: number;
}

export type TimerMode = 'timer' | 'stopwatch' | 'none';

export interface TimerPreferences {
  defaultMode: TimerMode;
  defaultDurationMinutes?: number;
}

interface Settings {
  theme: Theme;
  scoringRules: ScoringRules;
  timerPreferences: TimerPreferences;
}

interface SettingsContextType extends Settings {
  setTheme: (theme: Theme) => void;
  setScoringRules: (rules: ScoringRules) => void;
  setTimerPreferences: (prefs: TimerPreferences) => void;
}

const defaultSettings: Settings = {
  theme: "system",
  scoringRules: { correct: 4, incorrect: -1 },
  timerPreferences: { defaultMode: 'timer', defaultDurationMinutes: 10 },
};

const SETTINGS_STORAGE_KEY = "neetSheetAppSettings";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultSettings.theme);
  const [scoringRules, setScoringRulesState] = useState<ScoringRules>(defaultSettings.scoringRules);
  const [timerPreferences, setTimerPreferencesState] = useState<TimerPreferences>(defaultSettings.timerPreferences);

  // Effect for initializing all settings from localStorage
  useEffect(() => {
    const storedSettingsRaw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettingsRaw) {
      try {
        const storedSettings = JSON.parse(storedSettingsRaw);
        if (storedSettings.theme) setThemeState(storedSettings.theme);
        if (storedSettings.scoringRules) setScoringRulesState(storedSettings.scoringRules);
        if (storedSettings.timerPreferences) setTimerPreferencesState(storedSettings.timerPreferences);
      } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
        // Fallback to default settings if parsing fails
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
      }
    } else {
      // If no settings in localStorage, save defaults
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
    }
  }, []);

  const saveSettings = useCallback((newSettings: Partial<Settings>) => {
    const currentSettings = { theme, scoringRules, timerPreferences, ...newSettings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
  }, [theme, scoringRules, timerPreferences]);


  // Effect for applying theme to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    const effectiveTheme = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    
    root.classList.remove("light", "dark");
    root.classList.add(effectiveTheme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    saveSettings({ theme: newTheme });
  }, [saveSettings]);

  const setScoringRules = useCallback((newRules: ScoringRules) => {
    setScoringRulesState(newRules);
    saveSettings({ scoringRules: newRules });
  }, [saveSettings]);

  const setTimerPreferences = useCallback((newPrefs: TimerPreferences) => {
    setTimerPreferencesState(newPrefs);
    saveSettings({ timerPreferences: newPrefs });
  }, [saveSettings]);


  return (
    <SettingsContext.Provider value={{ 
      theme, 
      setTheme, 
      scoringRules, 
      setScoringRules,
      timerPreferences,
      setTimerPreferences
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
