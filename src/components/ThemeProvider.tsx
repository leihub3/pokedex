"use client";

import { useEffect, useRef } from "react";
import { usePokemonStore } from "@/store/pokemonStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDarkMode = usePokemonStore((state) => state.isDarkMode);
  const isInitialMount = useRef(true);

  // Apply theme on mount and when it changes
  useEffect(() => {
    const root = document.documentElement;
    
    // On initial mount, apply theme from store
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const storedTheme = usePokemonStore.getState().isDarkMode;
      if (storedTheme) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      return;
    }

    // On subsequent updates, apply theme from prop
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  return <>{children}</>;
}

