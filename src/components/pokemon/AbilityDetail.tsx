"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Ability } from "@/types/api";

interface AbilityDetailProps {
  ability: Ability;
}

export function AbilityDetail({ ability }: AbilityDetailProps) {
  const [showAllPokemon, setShowAllPokemon] = useState(false);
  const englishEffect = ability.effect_entries.find(
    (entry) => entry.language.name === "en"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="mb-4 text-4xl font-bold capitalize text-gray-900 dark:text-gray-100">
          {ability.name.replace(/-/g, " ")}
        </h1>
        {englishEffect && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Effect
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {englishEffect.effect}
            </p>
          </div>
        )}
      </div>

      {ability.pokemon.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Pokémon with this ability ({ability.pokemon.length})
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {ability.pokemon
              .slice(0, showAllPokemon ? ability.pokemon.length : 24)
              .map((pokemonEntry) => {
                const pokemonId = pokemonEntry.pokemon.url.match(/\/pokemon\/(\d+)\//)?.[1];
                return (
                  <Link
                    key={pokemonEntry.pokemon.name}
                    href={`/pokemon/${pokemonId}`}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-center text-sm capitalize transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                  >
                    {pokemonEntry.pokemon.name.replace(/-/g, " ")}
                    {pokemonEntry.is_hidden && (
                      <span className="ml-1 text-xs text-gray-500">(H)</span>
                    )}
                  </Link>
                );
              })}
          </div>
          {ability.pokemon.length > 24 && !showAllPokemon && (
            <motion.button
              onClick={() => setShowAllPokemon(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Show all {ability.pokemon.length} Pokémon ({ability.pokemon.length - 24} more)
            </motion.button>
          )}
          {showAllPokemon && ability.pokemon.length > 24 && (
            <motion.button
              onClick={() => setShowAllPokemon(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Show less
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}

