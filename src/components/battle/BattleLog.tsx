"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BattleEvent } from "@/battle-engine";

interface BattleLogProps {
  log: BattleEvent[];
  pokemon1Name: string;
  pokemon2Name: string;
}

export function BattleLog({ log, pokemon1Name, pokemon2Name }: BattleLogProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom within the log container only (not the whole page)
    // This prevents the page from scrolling and losing focus on the battle opponents
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Use scrollTo on the container instead of scrollIntoView to avoid page scroll
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [log]);

  const formatEvent = (event: BattleEvent): string => {
    const getPokemonName = (index: number) =>
      index === 0 ? pokemon1Name : pokemon2Name;

    switch (event.type) {
      case "battle_start":
        return `Battle started: ${event.pokemon1} vs ${event.pokemon2}`;
      case "turn_start":
        return `--- Turn ${event.turnNumber} ---`;
      case "move_used":
        return `${getPokemonName(event.pokemonIndex)} used ${event.moveName}!`;
      case "move_missed":
        return `${getPokemonName(event.pokemonIndex)}'s ${event.moveName} missed!`;
      case "damage_dealt":
        const effectivenessHint = event.damage > 50 ? " (It's super effective!)" : event.damage < 10 ? " (It's not very effective...)" : "";
        return `It dealt ${event.damage} damage!${effectivenessHint} ${getPokemonName(event.pokemonIndex)} has ${event.remainingHP} HP left.`;
      case "status_applied":
        const statusType = event.status.type;
        const statusName =
          statusType === "burn"
            ? "burned"
            : statusType === "poison"
            ? "poisoned"
            : statusType === "paralysis"
            ? "paralyzed"
            : "fell asleep";
        return `${getPokemonName(event.pokemonIndex)} is ${statusName}!`;
      case "status_damage":
        const statusLabel =
          event.statusType === "burn"
            ? "burn"
            : event.statusType === "poison"
            ? "poison"
            : event.statusType;
        return `${getPokemonName(event.pokemonIndex)} is hurt by ${statusLabel}! ${event.remainingHP} HP left.`;
      case "status_healed":
        return `${getPokemonName(event.pokemonIndex)} woke up!`;
      case "stat_changed":
        const statName = event.stat.charAt(0).toUpperCase() + event.stat.slice(1);
        const direction = event.newStage > event.oldStage ? "rose" : "fell";
        return `${getPokemonName(event.pokemonIndex)}'s ${statName} ${direction}!`;
      case "faint":
        return `${getPokemonName(event.pokemonIndex)} fainted!`;
      case "turn_end":
        return `--- End of Turn ${event.turnNumber} ---`;
      default:
        return JSON.stringify(event);
    }
  };

  const getEventColor = (event: BattleEvent): string => {
    switch (event.type) {
      case "battle_start":
        return "text-blue-600 dark:text-blue-400";
      case "damage_dealt":
        return "text-red-600 dark:text-red-400";
      case "status_applied":
      case "status_damage":
        return "text-purple-600 dark:text-purple-400";
      case "stat_changed":
        return "text-green-600 dark:text-green-400";
      case "faint":
        return "text-gray-600 dark:text-gray-400 font-bold";
      case "move_missed":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Battle Log
        </h3>
      </div>
      <div 
        ref={scrollContainerRef}
        className="max-h-64 overflow-y-auto p-4"
      >
        <AnimatePresence initial={false}>
          {log.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`mb-2 text-sm ${getEventColor(event)}`}
            >
              {formatEvent(event)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

