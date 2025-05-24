"use client";
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

// Define other settings interfaces as needed
// interface ScoringRules { correct: number; incorrect: number; }
// interface TimerPreferences { defaultMode: 'timer' | 'stopwatch' | 'none'; defaultDuration?: number; }

interface Settings {
  theme: Theme;
  // scoringRules: ScoringRules;
  // timerPreferences: TimerPreferences;
}

interface SettingsContextType extends Settings {
  setTheme: (theme: Theme) => void;
  // setScoringRules: (rules: ScoringRules) => void;
  // setTimerPreferences: (prefs: TimerPreferences) => void;
}

const defaultSettings: Settings = {
  theme: "system",
  // scoringRules: { correct: 4, incorrect: -1 },
  // timerPreferences: { defaultMode: 'timer', defaultDuration: 600 },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultSettings.theme);
  // Add other settings states here

  // Effect for initializing theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    } else {
      setThemeState(defaultSettings.theme);
    }
  }, []);

  // Effect for applying theme to HTML element and saving to localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
      // For system, we don't override localStorage unless user explicitly chooses light/dark
    } else {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (newTheme !== "system") {
      localStorage.setItem("theme", newTheme);
    } else {
      // When switching to system, remove the explicit theme from localStorage
      // so it can truly follow system preference on next load.
      localStorage.removeItem("theme");
    }
  }, []);

  // Add other setter functions here

  return (
    <SettingsContext.Provider value={{ theme, setTheme /*, other settings and setters */ }}>
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
