"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TypeEffectivenessChart } from "@/components/charts/TypeEffectivenessChart";
import { Badge } from "@/components/ui/Badge";
import { getTypeColor } from "@/lib/utils/typeColors";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import type { PokemonTypeResponse } from "@/types/api";

interface TypeExplorerClientProps {
  initialTypes: PokemonTypeResponse[];
}

export function TypeExplorerClient({ initialTypes }: TypeExplorerClientProps) {
  const [selectedType, setSelectedType] = useState<PokemonTypeResponse | null>(
    initialTypes[0] ?? null
  );

  return (
    <div className="space-y-8">
      {/* Type Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        {initialTypes.map((type) => {
          const colors = getTypeColor(type.name);
          const isSelected = selectedType?.id === type.id;

          return (
            <motion.button
              key={type.id}
              variants={staggerItem}
              onClick={() => setSelectedType(type)}
              className={`${colors.bg} ${colors.text} relative overflow-hidden rounded-lg p-4 text-center font-semibold transition-all ${
                isSelected
                  ? "ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
                  : "hover:scale-105 hover:shadow-lg"
              }`}
            >
              <div className="relative z-10">
                <div className="text-lg capitalize">{type.name}</div>
                <div className="text-xs opacity-80">
                  {type.pokemon.length} Pokémon
                </div>
              </div>
              {isSelected && (
                <motion.div
                  layoutId="selectedType"
                  className="absolute inset-0 bg-white/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Selected Type Details */}
      {selectedType && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800"
        >
          <div>
            <h2 className="mb-4 text-2xl font-bold capitalize text-gray-900 dark:text-gray-100">
              {selectedType.name}
            </h2>
            <TypeEffectivenessChart type={selectedType} />
          </div>

          {/* Pokémon of this type */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Pokémon with this type ({selectedType.pokemon.length})
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {selectedType.pokemon.slice(0, 24).map((pokemonEntry) => {
                const pokemonId = pokemonEntry.pokemon.url.match(/\/pokemon\/(\d+)\//)?.[1];
                return (
                  <motion.a
                    key={pokemonEntry.pokemon.name}
                    href={`/pokemon/${pokemonId}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-center text-sm capitalize transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                  >
                    {pokemonEntry.pokemon.name.replace(/-/g, " ")}
                  </motion.a>
                );
              })}
            </div>
            {selectedType.pokemon.length > 24 && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                And {selectedType.pokemon.length - 24} more...
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

