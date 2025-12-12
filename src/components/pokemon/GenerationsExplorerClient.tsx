"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getGenerationById } from "@/lib/api/generations";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import type { GenerationListResponse, Generation } from "@/types/api";

interface GenerationsExplorerClientProps {
  initialData: GenerationListResponse;
}

const starterPokemon = {
  "generation-i": [1, 4, 7],
  "generation-ii": [152, 155, 158],
  "generation-iii": [252, 255, 258],
  "generation-iv": [387, 390, 393],
  "generation-v": [495, 498, 501],
  "generation-vi": [650, 653, 656],
  "generation-vii": [722, 725, 728],
  "generation-viii": [810, 813, 816],
  "generation-ix": [906, 909, 912],
};

export function GenerationsExplorerClient({
  initialData,
}: GenerationsExplorerClientProps) {
  const [selectedGeneration, setSelectedGeneration] =
    useState<Generation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerationClick = async (generationUrl: string) => {
    setIsLoading(true);
    try {
      const match = generationUrl.match(/\/generation\/(\d+)\//);
      if (match) {
        const generation = await getGenerationById(parseInt(match[1], 10));
        setSelectedGeneration(generation);
      }
    } catch (error) {
      console.error("Error fetching generation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoaderSpinner size="lg" />
      </div>
    );
  }

  if (selectedGeneration) {
    const starters = starterPokemon[selectedGeneration.name as keyof typeof starterPokemon] || [];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <button
          onClick={() => setSelectedGeneration(null)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to Generations
        </button>

        <div>
          <h2 className="mb-4 text-3xl font-bold capitalize text-gray-900 dark:text-gray-100">
            {selectedGeneration.name.replace(/-/g, " ")}
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {selectedGeneration.pokemon_species.length} Pokémon
          </p>

          {/* Starter Pokémon */}
          {starters.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                Starter Pokémon
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {starters.map((starterId) => {
                  const starter = selectedGeneration.pokemon_species.find(
                    (p) => {
                      const match = p.url.match(/\/pokemon-species\/(\d+)\//);
                      return match && parseInt(match[1], 10) === starterId;
                    }
                  );
                  if (!starter) return null;
                  return (
                    <Link
                      key={starterId}
                      href={`/pokemon/${starterId}`}
                      className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4 text-center transition-colors hover:bg-yellow-100 dark:border-yellow-500 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30"
                    >
                      <h4 className="font-semibold capitalize text-gray-900 dark:text-gray-100">
                        {starter.name.replace(/-/g, " ")}
                      </h4>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Pokémon */}
          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              All Pokémon
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {selectedGeneration.pokemon_species.map((pokemon) => {
                const pokemonId = pokemon.url.match(/\/pokemon-species\/(\d+)\//)?.[1];
                return (
                  <Link
                    key={pokemon.name}
                    href={`/pokemon/${pokemonId}`}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-center text-sm capitalize transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                  >
                    {pokemon.name.replace(/-/g, " ")}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
    >
      {initialData.results.map((generation) => (
        <motion.button
          key={generation.name}
          variants={staggerItem}
          onClick={() => handleGenerationClick(generation.url)}
          whileHover={{ scale: 1.05, y: -4 }}
          className="rounded-lg border border-gray-200 bg-white p-8 text-left shadow-sm transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-800"
        >
          <h3 className="text-2xl font-bold capitalize text-gray-900 dark:text-gray-100">
            {generation.name.replace(/-/g, " ")}
          </h3>
        </motion.button>
      ))}
    </motion.div>
  );
}

