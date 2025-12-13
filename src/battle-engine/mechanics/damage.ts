import type { SeededRNG } from "../rng";
import type { Pokemon } from "../models/pokemon";
import type { Move } from "../models/move";
import type { StatStages } from "../models/stats";
import type { StatusCondition } from "../models/status";
import { hasSTAB } from "../models/pokemon";
import { isPhysicalMove } from "../models/move";
import { isStatus } from "../models/status";
import { getTypeEffectiveness } from "./typeEffectiveness";
import { getEffectiveStat } from "./statStages";

/**
 * Damage calculation parameters
 */
const BATTLE_LEVEL = 50; // Standard battle level

/**
 * Calculate damage dealt by a move
 * Uses Gen 8+ damage formula
 * 
 * Formula: (((2 * level / 5 + 2) * power * attack / defense) / 50 + 2) * modifiers
 * 
 * Modifiers:
 * - STAB (1.5x if move type matches Pokemon type)
 * - Type effectiveness (0, 0.25, 0.5, 1, 2, 4)
 * - Burn penalty (0.5x for physical moves if burned)
 * - Random factor (0.85-1.0)
 * - Stat stage multipliers (already applied to attack/defense stats)
 */
export function calculateDamage(
  attacker: Pokemon,
  defender: Pokemon,
  move: Move,
  attackerStages: StatStages,
  defenderStages: StatStages,
  attackerStatus: StatusCondition | null,
  rng: SeededRNG
): number {
  // Non-damaging moves do 0 damage
  if (move.power === null || move.power === 0) {
    return 0;
  }

  // Get attack stat (physical or special)
  const isPhysical = isPhysicalMove(move);
  const attackStat = isPhysical
    ? getEffectiveStat(attacker.baseStats.attack, attackerStages.attack)
    : getEffectiveStat(
        attacker.baseStats.specialAttack,
        attackerStages.specialAttack
      );

  // Get defense stat (physical or special)
  const defenseStat = isPhysical
    ? getEffectiveStat(defender.baseStats.defense, defenderStages.defense)
    : getEffectiveStat(
        defender.baseStats.specialDefense,
        defenderStages.specialDefense
      );

  // Base damage calculation
  const levelFactor = (2 * BATTLE_LEVEL) / 5 + 2;
  const baseDamage = (levelFactor * move.power * attackStat) / defenseStat;
  const damageWithBase = Math.floor(baseDamage / 50 + 2);

  // Calculate modifiers
  let modifier = 1.0;

  // STAB (Same Type Attack Bonus) - 1.5x if move type matches Pokemon type
  if (hasSTAB(attacker, move.type)) {
    modifier *= 1.5;
  }

  // Type effectiveness
  const effectiveness = getTypeEffectiveness(
    move.type,
    defender.types
  );
  modifier *= effectiveness;

  // Burn penalty - physical moves do 0.5x damage if attacker is burned
  if (isPhysical && isStatus(attackerStatus, "burn")) {
    modifier *= 0.5;
  }

  // Random factor (0.85 to 1.0)
  const randomFactor = rng.nextFloat(0.85, 1.0);
  modifier *= randomFactor;

  // Calculate final damage
  const finalDamage = Math.floor(damageWithBase * modifier);

  // Minimum damage is 1 (unless type effectiveness is 0)
  if (effectiveness === 0) {
    return 0;
  }

  return Math.max(1, finalDamage);
}

