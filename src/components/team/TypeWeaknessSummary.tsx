"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { getTypeColor } from "@/lib/utils/typeColors";
import { calculateEffectiveness } from "@/lib/utils/typeEffectiveness";
import type { Pokemon } from "@/types/api";

interface TypeWeaknessSummaryProps {
  team: Pokemon[];
}

const allTypes = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

export function TypeWeaknessSummary({ team }: TypeWeaknessSummaryProps) {
  const weaknesses = useMemo(() => {
    const weaknessMap: Record<string, number> = {};

    // Calculate weaknesses for each type against the team
    allTypes.forEach((type) => {
      let totalDamage = 0;
      team.forEach((pokemon) => {
        const pokemonTypes = pokemon.types.map((t) => t.type.name);
        const effectiveness = calculateEffectiveness(type, pokemonTypes);
        totalDamage += effectiveness;
      });
      if (totalDamage > team.length) {
        // More than 1x average damage = weakness
        weaknessMap[type] = totalDamage / team.length;
      }
    });

    return Object.entries(weaknessMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Top 5 weaknesses
  }, [team]);

  const resistances = useMemo(() => {
    const resistanceMap: Record<string, number> = {};

    allTypes.forEach((type) => {
      let totalDamage = 0;
      team.forEach((pokemon) => {
        const pokemonTypes = pokemon.types.map((t) => t.type.name);
        const effectiveness = calculateEffectiveness(type, pokemonTypes);
        totalDamage += effectiveness;
      });
      if (totalDamage < team.length) {
        // Less than 1x average damage = resistance
        resistanceMap[type] = totalDamage / team.length;
      }
    });

    return Object.entries(resistanceMap)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 5); // Top 5 resistances
  }, [team]);

  if (team.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Type Weaknesses
        </h3>
        {weaknesses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {weaknesses.map(([type, multiplier]) => {
              const colors = getTypeColor(type);
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <Badge variant="type" typeName={type}>
                    {type}
                  </Badge>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {multiplier.toFixed(2)}×
                  </span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No significant weaknesses found
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Type Resistances
        </h3>
        {resistances.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {resistances.map(([type, multiplier]) => {
              const colors = getTypeColor(type);
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <Badge variant="type" typeName={type}>
                    {type}
                  </Badge>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {multiplier.toFixed(2)}×
                  </span>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No significant resistances found
          </p>
        )}
      </div>
    </div>
  );
}

