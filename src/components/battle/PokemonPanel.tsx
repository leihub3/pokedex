"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { HPBar } from "./HPBar";
import { StatusBadge } from "./StatusBadge";
import { StatStageIndicator } from "./StatStageIndicator";
import { StatusEffects } from "./StatusEffects";
import { DamageNumber } from "./DamageNumber";
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
  damageAmount?: number; // Damage amount for display
  onDamageComplete?: () => void;
  speedMultiplier?: number;
  previousHP?: number; // Previous HP for HP bar animation
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
  damageAmount = 0,
  onDamageComplete,
  speedMultiplier = 1,
  previousHP,
}: PokemonPanelProps) {
  const { pokemon, currentHP, maxHP, status, statStages } = activePokemon;
  const isFainted = currentHP <= 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const hpBarRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [damageNumberPosition, setDamageNumberPosition] = useState<{ x: number; y: number } | null>(null);
  const [showDamageNumber, setShowDamageNumber] = useState(false);

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

  // Calculate damage number position when damage occurs
  useEffect(() => {
    if (isTakingDamage && damageAmount > 0 && hpBarRef.current) {
      const rect = hpBarRef.current.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        setDamageNumberPosition({
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top - containerRect.top,
        });
        setShowDamageNumber(true);
      }
    }
  }, [isTakingDamage, damageAmount]);

  // Reset damage state after animation
  useEffect(() => {
    if (isTakingDamage) {
      const timer = setTimeout(() => {
        setShowDamageNumber(false);
        onDamageComplete?.();
      }, (300 / speedMultiplier) * 2); // Damage flash duration * 2 (300ms now)

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
      className={`relative flex flex-col h-full rounded-xl border-2 border-gray-200 bg-white p-6 shadow-lg transition-all dark:border-gray-700 dark:bg-gray-800 ${
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
              isFainted && !prefersReducedMotion
                ? {
                    // Dramatic faint animation: fade, rotate, and slide down
                    opacity: [1, 1, 0.8, 0.3, 0],
                    rotate: [0, 5, -5, 10, -90],
                    y: [0, 0, 10, 30, 80],
                    scale: [1, 1, 0.95, 0.9, 0.8],
                  }
                : isAttacking && !isFainted && !prefersReducedMotion
                ? {
                    x: position === "left" ? [0, 30, 0] : [0, -30, 0],
                    scale: [1, 1.1, 1],
                  }
                : isTakingDamage && !isFainted && !prefersReducedMotion
                ? {
                    // More pronounced shake: 8-10px
                    x: [
                      Math.random() * 10 - 5,
                      Math.random() * 10 - 5,
                      Math.random() * 10 - 5,
                      Math.random() * 10 - 5,
                      0,
                    ],
                    y: [
                      Math.random() * 10 - 5,
                      Math.random() * 10 - 5,
                      Math.random() * 10 - 5,
                      Math.random() * 10 - 5,
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
                : isFainted
                ? 1200 / speedMultiplier / 1000 // 1200ms faint animation
                : isTakingDamage
                ? 300 / speedMultiplier / 1000 // Increased from 200ms to 300ms
                : 300 / speedMultiplier / 1000,
              ease: isFainted ? "easeInOut" : "easeOut",
              times: isFainted ? [0, 0.2, 0.5, 0.8, 1] : undefined,
            }}
            className="relative h-48 w-48"
            style={{
              filter:
                isFainted && !prefersReducedMotion
                  ? "grayscale(100%) brightness(0.3)"
                  : isTakingDamage && !prefersReducedMotion
                  ? "brightness(2)"
                  : "none",
            }}
          >
            <motion.div
              animate={
                isFainted && !prefersReducedMotion
                  ? {
                      // Red flash before faint
                      backgroundColor: [
                        "transparent",
                        "rgba(255,0,0,0.3)",
                        "rgba(255,0,0,0.5)",
                        "rgba(0,0,0,0.7)",
                        "rgba(0,0,0,0.9)",
                      ],
                    }
                  : isTakingDamage && !prefersReducedMotion
                  ? {
                      // Longer flash: 300ms duration
                      opacity: [1, 0.2, 1, 0.3, 1],
                      backgroundColor: ["transparent", "rgba(255,255,255,0.9)", "transparent", "rgba(255,255,255,0.6)", "transparent"],
                    }
                  : {}
              }
              transition={{
                duration: isFainted
                  ? 1200 / speedMultiplier / 1000
                  : 300 / speedMultiplier / 1000,
                times: isFainted 
                  ? [0, 0.15, 0.3, 0.7, 1] 
                  : isTakingDamage 
                  ? [0, 0.2, 0.4, 0.6, 0.8, 1] 
                  : [0, 0.25, 0.5, 0.75, 1],
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 / speedMultiplier, duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center bg-gray-900/70"
              >
                <span className="text-2xl font-bold text-white drop-shadow-lg">FAINTED</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="h-48 w-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
        )}
      </div>

      {/* Pokemon Info */}
      <div className="space-y-3">
        {/* Name and Level - Fixed height to accommodate 2 lines */}
        <div className="flex min-h-[3rem] items-start justify-between">
          <h3 className="text-xl font-bold capitalize leading-tight text-gray-900 dark:text-gray-100">
            {pokemon.name}
          </h3>
          <span className="flex-shrink-0 text-sm text-gray-600 dark:text-gray-400">
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
        <div ref={hpBarRef} className="relative">
          {showDamageNumber && damageNumberPosition && damageAmount > 0 && (
            <DamageNumber
              damage={damageAmount}
              position={damageNumberPosition}
              onComplete={() => setShowDamageNumber(false)}
            />
          )}
          <HPBar
            currentHP={currentHP}
            maxHP={maxHP}
            pokemonName={pokemon.name}
            previousHP={previousHP}
            isKO={isFainted}
          />
        </div>

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

