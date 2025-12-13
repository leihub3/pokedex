import { calculateEffectiveness, type Effectiveness } from "@/lib/utils/typeEffectiveness";

export type { Effectiveness };

/**
 * Calculate move effectiveness against defender types
 */
export function calculateMoveEffectiveness(
  moveType: string,
  defenderTypes: string[]
): Effectiveness {
  return calculateEffectiveness(moveType, defenderTypes);
}

/**
 * Get effectiveness text and styling
 */
export function getEffectivenessText(
  effectiveness: Effectiveness
): { text: string; color: string; scale: number } {
  switch (effectiveness) {
    case 0:
      return {
        text: "It doesn't affect...",
        color: "#9CA3AF", // gray
        scale: 0.9,
      };
    case 0.25:
    case 0.5:
      return {
        text: "It's not very effective...",
        color: "#6B7280", // gray
        scale: 0.95,
      };
    case 1:
      return {
        text: "",
        color: "",
        scale: 1,
      };
    case 2:
      return {
        text: "It's super effective!",
        color: "#10B981", // green
        scale: 1.1,
      };
    case 4:
      return {
        text: "It's super effective!",
        color: "#F59E0B", // gold/amber
        scale: 1.15,
      };
    default:
      return {
        text: "",
        color: "",
        scale: 1,
      };
  }
}

/**
 * Track move to damage event relationship
 * This helps determine effectiveness when damage is dealt
 */
export interface MoveDamageMapping {
  moveType: string;
  defenderTypes: string[];
  timestamp: number;
}

/**
 * Find the most recent move that could have caused damage
 */
export function findRecentMoveForDamage(
  mappings: MoveDamageMapping[],
  maxAge: number = 2000 // 2 seconds
): MoveDamageMapping | null {
  const now = Date.now();
  const recent = mappings.filter((m) => now - m.timestamp < maxAge);
  return recent.length > 0 ? recent[recent.length - 1] : null;
}

