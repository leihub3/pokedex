import type { SeededRNG } from "../rng";

/**
 * Paralysis status effect
 * 
 * Effects:
 * - Speed reduction: 0.25x multiplier
 * - Can't act: 25% chance per turn (seeded RNG)
 */

/**
 * Speed multiplier for paralyzed Pokemon
 */
export const PARALYSIS_SPEED_MULTIPLIER = 0.25;

/**
 * Chance that a paralyzed Pokemon cannot act
 */
export const PARALYSIS_SKIP_CHANCE = 0.25;

/**
 * Get speed multiplier for paralyzed Pokemon
 */
export function getParalysisSpeedMultiplier(): number {
  return PARALYSIS_SPEED_MULTIPLIER;
}

/**
 * Check if a paralyzed Pokemon can act this turn
 * @param rng - Seeded RNG instance
 * @returns true if Pokemon can act, false if paralyzed
 */
export function canActWithParalysis(rng: SeededRNG): boolean {
  // 25% chance to be unable to act
  return !rng.chance(PARALYSIS_SKIP_CHANCE);
}

