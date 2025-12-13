"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { HPBar } from "./HPBar";
import { StatusBadge } from "./StatusBadge";
import { StatStageIndicator } from "./StatStageIndicator";
import { StatusEffects } from "./StatusEffects";
import type { ActivePokemon } from "@/battle-engine";

interface PokemonPanelProps {
  activePokemon: ActivePokemon;
  spriteUrl: string | null;
  position: "left" | "right";
  isAnimating: boolean;
  isAttacking?: boolean;
  attackType?: string | null;
  onAttackComplete?: () => void;
  isTakingDamage?: boolean;
  onDamageComplete?: () => void;
  speedMultiplier?: number;
}

export function PokemonPanel({
  activePokemon,
  spriteUrl,
  position,
  isAnimating,
  isAttacking = false,
  attackType = null,
  onAttackComplete,
  isTakingDamage = false,
  onDamageComplete,
  speedMultiplier = 1,
}: PokemonPanelProps) {
  const { pokemon, currentHP, maxHP, status, statStages } = activePokemon;
  const isFainted = currentHP <= 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  // Get primary type for glow effect
  const primaryType = pokemon.types[0] || "normal";

  // Measure container dimensions for particles
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Reset attack state after animation
  useEffect(() => {
    if (isAttacking) {
      const timer = setTimeout(() => {
        onAttackComplete?.();
      }, (300 / speedMultiplier) * 2); // Attack slide duration * 2

      return () => clearTimeout(timer);
    }
  }, [isAttacking, speedMultiplier, onAttackComplete]);

  // Reset damage state after animation
  useEffect(() => {
    if (isTakingDamage) {
      const timer = setTimeout(() => {
        onDamageComplete?.();
      }, (200 / speedMultiplier) * 2); // Damage flash duration * 2

      return () => clearTimeout(timer);
    }
  }, [isTakingDamage, speedMultiplier, onDamageComplete]);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, x: position === "left" ? -50 : 50 }}
      animate={{
        opacity: isFainted ? 0.5 : 1,
        x: 0,
        scale: isAnimating && !isFainted && !isAttacking ? [1, 1.05, 1] : 1,
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
      {/* Type Particles for Attack - rendered in BattleArena due to positioning */}

      {/* Pokemon Sprite */}
      <div className="mb-4 flex justify-center">
        {spriteUrl ? (
          <motion.div
            animate={
              isAttacking && !isFainted && !prefersReducedMotion
                ? {
                    x: position === "left" ? [0, 30, 0] : [0, -30, 0],
                    scale: [1, 1.1, 1],
                  }
                : isTakingDamage && !isFainted && !prefersReducedMotion
                ? {
                    x: [
                      Math.random() * 5 - 2.5,
                      Math.random() * 5 - 2.5,
                      Math.random() * 5 - 2.5,
                      0,
                    ],
                    y: [
                      Math.random() * 5 - 2.5,
                      Math.random() * 5 - 2.5,
                      Math.random() * 5 - 2.5,
                      0,
                    ],
                  }
                : isAnimating && !isFainted && !isAttacking && !isTakingDamage
                ? { x: [-5, 5, -5, 5, 0] }
                : {}
            }
            transition={{
              duration: prefersReducedMotion
                ? 0
                : isTakingDamage
                ? 200 / speedMultiplier / 1000
                : 300 / speedMultiplier / 1000,
              ease: "easeOut",
            }}
            className="relative h-48 w-48"
            style={{
              filter: isTakingDamage && !prefersReducedMotion ? "brightness(2)" : "none",
            }}
          >
            <motion.div
              animate={
                isTakingDamage && !prefersReducedMotion
                  ? {
                      opacity: [1, 0.3, 1, 0.3, 1],
                      backgroundColor: ["transparent", "rgba(255,255,255,0.8)", "transparent"],
                    }
                  : {}
              }
              transition={{
                duration: 200 / speedMultiplier / 1000,
                times: [0, 0.25, 0.5, 0.75, 1],
              }}
              className="relative h-full w-full"
            >
              <Image
                src={spriteUrl}
                alt={pokemon.name}
                fill
                className="object-contain"
                sizes="192px"
                priority
              />
            </motion.div>
            {/* Status Effect Particles */}
            {!isFainted && <StatusEffects status={status} />}
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

