import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  favorites: number[];
  addFavorite: (pokemonId: number) => void;
  removeFavorite: (pokemonId: number) => void;
  toggleFavorite: (pokemonId: number) => void;
  isFavorite: (pokemonId: number) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (pokemonId) =>
        set((state) => ({
          favorites: [...state.favorites, pokemonId],
        })),
      removeFavorite: (pokemonId) =>
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== pokemonId),
        })),
      toggleFavorite: (pokemonId) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(pokemonId)) {
          removeFavorite(pokemonId);
        } else {
          addFavorite(pokemonId);
        }
      },
      isFavorite: (pokemonId) => get().favorites.includes(pokemonId),
    }),
    {
      name: "pokemon-favorites",
    }
  )
);

