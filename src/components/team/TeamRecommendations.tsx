"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { getTypeColor } from "@/lib/utils/typeColors";
import type { Pokemon } from "@/types/api";

interface TeamRecommendationsProps {
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

export function TeamRecommendations({ team }: TeamRecommendationsProps) {
  const recommendations = useMemo(() => {
    if (team.length === 0) return [];

    // Get all types currently in team
    const teamTypes = new Set<string>();
    team.forEach((pokemon) => {
      pokemon.types.forEach((type) => {
        teamTypes.add(type.type.name);
      });
    });

    // Find missing types
    const missingTypes = allTypes.filter((type) => !teamTypes.has(type));

    // Prioritize types that cover common weaknesses
    // Common weaknesses: Fighting, Ground, Water, Electric, Psychic
    const priorityTypes = ["fighting", "ground", "water", "electric", "psychic"];
    const prioritized = missingTypes.sort((a, b) => {
      const aPriority = priorityTypes.indexOf(a);
      const bPriority = priorityTypes.indexOf(b);
      if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      return 0;
    });

    return prioritized.slice(0, 5);
  }, [team]);

  if (team.length === 0 || recommendations.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Recommended Types to Add
      </h3>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Consider adding Pokémon with these types to improve your team coverage:
      </p>
      <div className="flex flex-wrap gap-2">
        {recommendations.map((type) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
          >
            <Badge variant="type" typeName={type} hover>
              {type}
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

