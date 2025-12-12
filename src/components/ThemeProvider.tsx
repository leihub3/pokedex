"use client";

import { useEffect, useRef } from "react";
import { usePokemonStore } from "@/store/pokemonStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDarkMode = usePokemonStore((state) => state.isDarkMode);
  const hasInitialized = useRef(false);

  // Initialize theme on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const root = document.documentElement;
    
    // Check if user has a stored preference in localStorage
    const stored = localStorage.getItem("pokemon-storage");
    let storedTheme: boolean | null = null;
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        storedTheme = parsed.state?.isDarkMode ?? null;
      } catch (e) {
        // Invalid storage, ignore
      }
    }
    
    // If no stored preference, default to dark mode
    if (storedTheme === null) {
      // Default to dark mode for a premium dark experience
      usePokemonStore.setState({ isDarkMode: true });
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      // Apply stored preference
      if (storedTheme) {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
      }
    }
  }, []);

  // Apply theme when isDarkMode changes (user toggled or system changed)
  useEffect(() => {
    if (!hasInitialized.current) return;
    
    const root = document.documentElement;
    // Force reflow to ensure styles are applied
    if (isDarkMode) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  }, [isDarkMode]);

  return <>{children}</>;
}

