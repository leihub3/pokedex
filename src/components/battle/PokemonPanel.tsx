"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { HPBar } from "./HPBar";
import { StatusBadge } from "./StatusBadge";
import { StatStageIndicator } from "./StatStageIndicator";
import type { ActivePokemon } from "@/battle-engine";

interface PokemonPanelProps {
  activePokemon: ActivePokemon;
  spriteUrl: string | null;
  position: "left" | "right";
  isAnimating: boolean;
}

export function PokemonPanel({
  activePokemon,
  spriteUrl,
  position,
  isAnimating,
}: PokemonPanelProps) {
  const { pokemon, currentHP, maxHP, status, statStages } = activePokemon;
  const isFainted = currentHP <= 0;

  // Get primary type for glow effect
  const primaryType = pokemon.types[0] || "normal";

  return (
    <motion.div
      initial={{ opacity: 0, x: position === "left" ? -50 : 50 }}
      animate={{
        opacity: isFainted ? 0.5 : 1,
        x: 0,
        scale: isAnimating && !isFainted ? [1, 1.05, 1] : 1,
      }}
      transition={{
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
      }}
      className={`relative rounded-xl border-2 border-gray-200 bg-white p-6 shadow-lg transition-all dark:border-gray-700 dark:bg-gray-800 ${
        isFainted ? "grayscale" : ""
      }`}
      style={{
        boxShadow: isFainted
          ? "0 4px 6px rgba(0, 0, 0, 0.1)"
          : "0 10px 25px rgba(0, 0, 0, 0.15), 0 0 15px rgba(59, 130, 246, 0.1)",
      }}
    >
      {/* Pokemon Sprite */}
      <div className="mb-4 flex justify-center">
        {spriteUrl ? (
          <motion.div
            animate={isAnimating && !isFainted ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.3 }}
            className="relative h-48 w-48"
          >
            <Image
              src={spriteUrl}
              alt={pokemon.name}
              fill
              className="object-contain"
              sizes="192px"
              priority
            />
            {isFainted && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                <span className="text-2xl font-bold text-white">FAINTED</span>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="h-48 w-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
        )}
      </div>

      {/* Pokemon Info */}
      <div className="space-y-3">
        {/* Name and Level */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold capitalize text-gray-900 dark:text-gray-100">
            {pokemon.name}
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Lv. 50
          </span>
        </div>

        {/* Types */}
        <div className="flex gap-2">
          {pokemon.types.map((type) => (
            <Badge key={type} variant="type" typeName={type}>
              {type}
            </Badge>
          ))}
        </div>

        {/* HP Bar */}
        <HPBar currentHP={currentHP} maxHP={maxHP} pokemonName={pokemon.name} />

        {/* Status */}
        <div>
          <StatusBadge status={status} />
        </div>

        {/* Stat Stages */}
        <StatStageIndicator statStages={statStages} />
      </div>
    </motion.div>
  );
}

