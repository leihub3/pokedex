/**
 * Type effectiveness wrapper
 * Reuses the existing calculateEffectiveness function from the codebase
 */
import { calculateEffectiveness, type Effectiveness } from "@/lib/utils/typeEffectiveness";

/**
 * Calculate type effectiveness multiplier for a move against defending types
 * @param moveType - Type of the attacking move
 * @param defendingTypes - Types of the defending Pokemon
 */
export function getTypeEffectiveness(
  moveType: string,
  defendingTypes: string[]
): Effectiveness {
  return calculateEffectiveness(moveType, defendingTypes);
}

