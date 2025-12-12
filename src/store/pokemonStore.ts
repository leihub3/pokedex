import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Pokemon, PokemonListItem } from "@/types/api";

interface PokemonStore {
  // State
  pokemonList: Pokemon[];
  pokemonListItems: PokemonListItem[];
  allPokemonListItems: PokemonListItem[]; // Complete list for search
  searchQuery: string;
  selectedTypes: string[];
  isDarkMode: boolean;
  isLoading: boolean;
  hasMore: boolean;
  nextUrl: string | null;

  // Actions
  setPokemonList: (pokemon: Pokemon[]) => void;
  addPokemon: (pokemon: Pokemon[]) => void;
  setPokemonListItems: (items: PokemonListItem[]) => void;
  addPokemonListItems: (items: PokemonListItem[]) => void;
  setAllPokemonListItems: (items: PokemonListItem[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTypes: (types: string[]) => void;
  toggleType: (type: string) => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setNextUrl: (url: string | null) => void;
  resetFilters: () => void;
}

export const usePokemonStore = create<PokemonStore>()(
  persist(
    (set) => ({
      // Initial state
      pokemonList: [],
      pokemonListItems: [],
      allPokemonListItems: [],
      searchQuery: "",
      selectedTypes: [],
      isDarkMode: false,
      isLoading: false,
      hasMore: true,
      nextUrl: null,

      // Actions
      setPokemonList: (pokemon) => set({ pokemonList: pokemon }),
      addPokemon: (pokemon) =>
        set((state) => ({
          pokemonList: [...state.pokemonList, ...pokemon],
        })),
      setPokemonListItems: (items) => set({ pokemonListItems: items }),
      addPokemonListItems: (items) =>
        set((state) => ({
          pokemonListItems: [...state.pokemonListItems, ...items],
        })),
      setAllPokemonListItems: (items) => set({ allPokemonListItems: items }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedTypes: (types) => set({ selectedTypes: types }),
      toggleType: (type) =>
        set((state) => ({
          selectedTypes: state.selectedTypes.includes(type)
            ? state.selectedTypes.filter((t) => t !== type)
            : [...state.selectedTypes, type],
        })),
      toggleTheme: () =>
        set((state) => {
          const newTheme = !state.isDarkMode;
          // Update document class for Tailwind dark mode
          if (typeof window !== "undefined") {
            document.documentElement.classList.toggle("dark", newTheme);
          }
          return { isDarkMode: newTheme };
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      setHasMore: (hasMore) => set({ hasMore }),
      setNextUrl: (url) => set({ nextUrl: url }),
      resetFilters: () =>
        set({
          searchQuery: "",
          selectedTypes: [],
        }),
    }),
    {
      name: "pokemon-storage",
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        selectedTypes: state.selectedTypes,
      }),
      skipHydration: false,
    }
  )
);

