"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Move } from "@/types/api";

interface MoveDetailProps {
  move: Move;
}

export function MoveDetail({ move }: MoveDetailProps) {
  const [showAllPokemon, setShowAllPokemon] = useState(false);
  const englishEffect = move.effect_entries.find(
    (entry) => entry.language.name === "en"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="mb-2 text-4xl font-bold capitalize text-gray-900 dark:text-gray-100">
          {move.name.replace(/-/g, " ")}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="type" typeName={move.type.name}>
            {move.type.name}
          </Badge>
          <Badge>{move.damage_class.name}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Stats
          </h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Power</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">
                {move.power ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Accuracy</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">
                {move.accuracy ? `${move.accuracy}%` : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">PP</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">
                {move.pp ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Priority</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">
                {move.priority}
              </dd>
            </div>
            {move.effect_chance && (
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">
                  Effect Chance
                </dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100">
                  {move.effect_chance}%
                </dd>
              </div>
            )}
          </dl>
        </div>

        {englishEffect && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Effect
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {englishEffect.short_effect || englishEffect.effect}
            </p>
          </div>
        )}
      </div>

      {move.learned_by_pokemon.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Learned by ({move.learned_by_pokemon.length} Pokémon)
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {move.learned_by_pokemon
              .slice(0, showAllPokemon ? move.learned_by_pokemon.length : 24)
              .map((pokemon) => {
                const pokemonId = pokemon.url.match(/\/pokemon\/(\d+)\//)?.[1];
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
          {move.learned_by_pokemon.length > 24 && !showAllPokemon && (
            <motion.button
              onClick={() => setShowAllPokemon(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Show all {move.learned_by_pokemon.length} Pokémon ({move.learned_by_pokemon.length - 24} more)
            </motion.button>
          )}
          {showAllPokemon && move.learned_by_pokemon.length > 24 && (
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

