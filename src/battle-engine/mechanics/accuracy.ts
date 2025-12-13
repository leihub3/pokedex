import type { SeededRNG } from "../rng";
import type { Move } from "../models/move";

/**
 * Check if a move hits based on its accuracy
 * @param move - The move to check
 * @param rng - Seeded RNG instance
 * @returns true if the move hits, false if it misses
 */
export function checkAccuracy(move: Move, rng: SeededRNG): boolean {
  // Moves with null accuracy always hit (or are status moves)
  if (move.accuracy === null) {
    return true;
  }

  // Check if random chance is below accuracy percentage
  return rng.chance(move.accuracy / 100);
}

