import type { Move } from "../models/move";
import type { Pokemon } from "../models/pokemon";
import type { StatStages } from "../models/stats";
import { getEffectiveStat } from "./statStages";

/**
 * Turn order entry for sorting
 */
export interface TurnOrderEntry {
  pokemonIndex: number;
  movePriority: number;
  speed: number;
}

/**
 * Calculate effective speed for turn order
 * Takes into account stat stages
 */
export function getEffectiveSpeed(
  pokemon: Pokemon,
  stages: StatStages
): number {
  return getEffectiveStat(pokemon.baseStats.speed, stages.speed);
}

/**
 * Determine turn order based on move priority and Pokemon speed
 * Returns array of pokemon indices in order of execution
 * 
 * Rules:
 * 1. Higher priority moves go first
 * 2. If priority is equal, faster Pokemon goes first
 * 3. If speed is equal, order is determined by RNG (but for determinism, we use pokemon index)
 */
export function determineTurnOrder(
  moves: [Move, Move],
  pokemon: [Pokemon, Pokemon],
  statStages: [StatStages, StatStages]
): [0 | 1, 0 | 1] {
  const entries: TurnOrderEntry[] = [
    {
      pokemonIndex: 0,
      movePriority: moves[0].priority,
      speed: getEffectiveSpeed(pokemon[0], statStages[0]),
    },
    {
      pokemonIndex: 1,
      movePriority: moves[1].priority,
      speed: getEffectiveSpeed(pokemon[1], statStages[1]),
    },
  ];

  // Sort by priority (higher first), then by speed (higher first)
  entries.sort((a, b) => {
    if (a.movePriority !== b.movePriority) {
      return b.movePriority - a.movePriority;
    }
    if (a.speed !== b.speed) {
      return b.speed - a.speed;
    }
    // If everything is equal, maintain original order (deterministic)
    return a.pokemonIndex - b.pokemonIndex;
  });

  // Type assertion is safe because pokemonIndex is always 0 or 1
  return [entries[0].pokemonIndex as 0 | 1, entries[1].pokemonIndex as 0 | 1];
}

