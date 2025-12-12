"use client";

import { useEffect } from "react";
import { usePokemonStore } from "@/store/pokemonStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDarkMode = usePokemonStore((state) => state.isDarkMode);

  // Initialize theme from store (which reads from localStorage)
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  return <>{children}</>;
}

