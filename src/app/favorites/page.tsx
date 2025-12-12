"use client";

import { useFavoritesStore } from "@/store/favoritesStore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPokemonById } from "@/lib/api/pokemon";
import { PokemonCard } from "@/components/pokemon/PokemonCard";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import type { Pokemon } from "@/types/api";

export default function FavoritesPage() {
  const { favorites } = useFavoritesStore();
  const [favoritePokemon, setFavoritePokemon] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        const pokemonList = await Promise.all(
          favorites.map((id) => getPokemonById(id))
        );
        setFavoritePokemon(pokemonList);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (favorites.length > 0) {
      fetchFavorites();
    } else {
      setIsLoading(false);
    }
  }, [favorites]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            My Favorites
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {favorites.length} Pokémon saved
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoaderSpinner size="lg" />
          </div>
        ) : favoritePokemon.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {favoritePokemon.map((pokemon, index) => (
              <motion.div key={pokemon.id} variants={staggerItem}>
                <PokemonCard pokemon={pokemon} index={index} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No favorites yet. Start adding Pokémon to your favorites!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

