
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { UserProfile } from '@/lib/types';

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
  userProfile: UserProfile | null;
  isOnboardingComplete: boolean;
}

interface SettingsContextType extends Settings {
  setTheme: (theme: Theme) => void;
  setScoringRules: (rules: ScoringRules) => void;
  setTimerPreferences: (prefs: TimerPreferences) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  completeOnboarding: () => void;
  recordTestCompletion: () => void;
}

const defaultSettings: Settings = {
  theme: "system",
  scoringRules: { correct: 4, incorrect: -1 },
  timerPreferences: { defaultMode: 'timer', defaultDurationMinutes: 10 },
  userProfile: {
    name: "",
    dailyStreak: 0,
    lastTestCompletedDate: undefined,
    weeklyTestGoal: 3, // Default weekly goal
  },
  isOnboardingComplete: false,
};

const SETTINGS_STORAGE_KEY = "neetSheetAppSettings";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultSettings.theme);
  const [scoringRules, setScoringRulesState] = useState<ScoringRules>(defaultSettings.scoringRules);
  const [timerPreferences, setTimerPreferencesState] = useState<TimerPreferences>(defaultSettings.timerPreferences);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(defaultSettings.userProfile);
  const [isOnboardingComplete, setIsOnboardingCompleteState] = useState<boolean>(defaultSettings.isOnboardingComplete);

  // Effect for initializing all settings from localStorage
  useEffect(() => {
    const storedSettingsRaw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettingsRaw) {
      try {
        const storedSettings = JSON.parse(storedSettingsRaw);
        if (storedSettings.theme) setThemeState(storedSettings.theme);
        if (storedSettings.scoringRules) setScoringRulesState(storedSettings.scoringRules);
        if (storedSettings.timerPreferences) setTimerPreferencesState(storedSettings.timerPreferences);
        
        // Initialize userProfile with defaults if parts are missing from localStorage
        const loadedProfile = storedSettings.userProfile || {};
        setUserProfileState({
            name: loadedProfile.name || defaultSettings.userProfile?.name || "",
            neetClass: loadedProfile.neetClass || defaultSettings.userProfile?.neetClass,
            targetNeetYear: loadedProfile.targetNeetYear || defaultSettings.userProfile?.targetNeetYear,
            dailyStreak: loadedProfile.dailyStreak || defaultSettings.userProfile?.dailyStreak || 0,
            lastTestCompletedDate: loadedProfile.lastTestCompletedDate || defaultSettings.userProfile?.lastTestCompletedDate,
            weeklyTestGoal: loadedProfile.weeklyTestGoal === undefined ? defaultSettings.userProfile?.weeklyTestGoal : loadedProfile.weeklyTestGoal,
        });

        if (storedSettings.isOnboardingComplete) setIsOnboardingCompleteState(storedSettings.isOnboardingComplete);
      } catch (e) {
        console.error("Failed to parse settings from localStorage", e);
        // If parsing fails, reset to default to avoid broken state
        setThemeState(defaultSettings.theme);
        setScoringRulesState(defaultSettings.scoringRules);
        setTimerPreferencesState(defaultSettings.timerPreferences);
        setUserProfileState(defaultSettings.userProfile);
        setIsOnboardingCompleteState(defaultSettings.isOnboardingComplete);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
      }
    } else {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
    }
  }, []);

  const saveSettings = useCallback(() => {
    const currentSettingsToSave = { 
      theme, 
      scoringRules, 
      timerPreferences,
      userProfile,
      isOnboardingComplete 
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettingsToSave));
  }, [theme, scoringRules, timerPreferences, userProfile, isOnboardingComplete]);

  useEffect(() => {
    saveSettings();
  }, [theme, scoringRules, timerPreferences, userProfile, isOnboardingComplete, saveSettings]);


  useEffect(() => {
    const root = window.document.documentElement;
    const effectiveTheme = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    
    root.classList.remove("light", "dark");
    root.classList.add(effectiveTheme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setScoringRules = (newRules: ScoringRules) => {
    setScoringRulesState(newRules);
  };

  const setTimerPreferences = (newPrefs: TimerPreferences) => {
    setTimerPreferencesState(newPrefs);
  };

  const setUserProfile = (newProfile: UserProfile | null) => {
    setUserProfileState(newProfile);
  };

  const completeOnboarding = () => {
    setIsOnboardingCompleteState(true);
  };

  const recordTestCompletion = useCallback(() => {
    setUserProfileState(prevProfile => {
      if (!prevProfile) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day
      const lastCompletionDateString = prevProfile.lastTestCompletedDate;
      
      let newStreak = prevProfile.dailyStreak || 0;

      if (lastCompletionDateString) {
        const lastCompletion = new Date(lastCompletionDateString);
        lastCompletion.setHours(0, 0, 0, 0); // Normalize

        const diffTime = today.getTime() - lastCompletion.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          newStreak++;
        } else if (diffDays > 1) {
          newStreak = 1; // Reset streak
        }
        // If diffDays is 0 (same day), streak doesn't change
      } else {
        newStreak = 1; // First test completion
      }
      
      return {
        ...prevProfile,
        dailyStreak: newStreak,
        lastTestCompletedDate: today.toISOString().split('T')[0], // Store as YYYY-MM-DD
      };
    });
  }, []);


  return (
    <SettingsContext.Provider value={{ 
      theme, 
      setTheme, 
      scoringRules, 
      setScoringRules,
      timerPreferences,
      setTimerPreferences,
      userProfile,
      setUserProfile,
      isOnboardingComplete,
      completeOnboarding,
      recordTestCompletion
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
