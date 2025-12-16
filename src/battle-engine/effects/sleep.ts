import type { SeededRNG } from "../rng";
import type { StatusCondition } from "../models/status";

/**
 * Sleep status effect
 * 
 * Effects:
 * - Cannot act: true (for N turns)
 * - Sleep counter: decreases by 1 per turn
 * - Wakes up: when counter reaches 0
 * - Initial sleep duration: random 1-3 turns
 */

/**
 * Generate initial sleep duration (1-3 turns)
 */
export function generateSleepDuration(rng: SeededRNG): number {
  return rng.nextInt(3) + 1; // 1, 2, or 3 turns
}

/**
 * Check if a sleeping Pokemon can act
 */
export function canActWithSleep(status: StatusCondition): boolean {
  if (status.type !== "sleep") {
    return true;
  }
  return status.turnsRemaining === 0;
}

/**
 * Decrement sleep counter and return new status
 * Returns null if Pokemon wakes up
 */
export function processSleepTurn(status: StatusCondition): StatusCondition | null {
  if (status.type !== "sleep") {
    return status;
  }

  const newTurnsRemaining = status.turnsRemaining - 1;
  if (newTurnsRemaining <= 0) {
    return null; // Woke up
  }

  return {
    type: "sleep",
    turnsRemaining: newTurnsRemaining,
  };
}



