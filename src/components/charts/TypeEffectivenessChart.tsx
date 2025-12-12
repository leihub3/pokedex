"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { getTypeColor } from "@/lib/utils/typeColors";
import type { PokemonTypeResponse } from "@/types/api";

interface TypeEffectivenessChartProps {
  type: PokemonTypeResponse;
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

export function TypeEffectivenessChart({ type }: TypeEffectivenessChartProps) {
  const effectivenessMap = useMemo(() => {
    const map: Record<string, number> = {};
    const relations = type.damage_relations;

    // Calculate effectiveness for each type
    allTypes.forEach((typeName) => {
      let multiplier = 1;

      // Check double damage from
      if (relations.double_damage_from.some((t) => t.name === typeName)) {
        multiplier *= 2;
      }
      // Check half damage from
      if (relations.half_damage_from.some((t) => t.name === typeName)) {
        multiplier *= 0.5;
      }
      // Check no damage from
      if (relations.no_damage_from.some((t) => t.name === typeName)) {
        multiplier *= 0;
      }

      map[typeName] = multiplier;
    });

    return map;
  }, [type]);

  const getEffectivenessColor = (multiplier: number) => {
    if (multiplier === 0) return "bg-gray-800 dark:bg-gray-700";
    if (multiplier === 0.25) return "bg-red-900 dark:bg-red-800";
    if (multiplier === 0.5) return "bg-red-600 dark:bg-red-500";
    if (multiplier === 1) return "bg-gray-400 dark:bg-gray-500";
    if (multiplier === 2) return "bg-green-500 dark:bg-green-600";
    if (multiplier === 4) return "bg-green-700 dark:bg-green-800";
    return "bg-gray-400 dark:bg-gray-500";
  };

  const getEffectivenessLabel = (multiplier: number) => {
    if (multiplier === 0) return "0×";
    if (multiplier === 0.25) return "0.25×";
    if (multiplier === 0.5) return "0.5×";
    if (multiplier === 1) return "1×";
    if (multiplier === 2) return "2×";
    if (multiplier === 4) return "4×";
    return "1×";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Type Effectiveness
      </h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-9">
        {allTypes.map((typeName) => {
          const multiplier = effectivenessMap[typeName] ?? 1;
          const colors = getTypeColor(typeName);
          const effectivenessColor = getEffectivenessColor(multiplier);

          return (
            <motion.div
              key={typeName}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div
                className={`${colors.bg} ${colors.text} rounded-lg p-2 text-center text-xs font-medium`}
              >
                {typeName}
              </div>
              <div
                className={`${effectivenessColor} mt-1 rounded px-1 py-0.5 text-center text-xs font-bold text-white`}
              >
                {getEffectivenessLabel(multiplier)}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-green-500"></div>
          <span>Super effective (2×)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gray-400"></div>
          <span>Normal (1×)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-600"></div>
          <span>Not very effective (0.5×)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gray-800"></div>
          <span>No effect (0×)</span>
        </div>
      </div>
    </div>
  );
}

