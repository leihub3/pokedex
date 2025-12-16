import type { Pokemon } from "../models/pokemon";
import type { Move } from "../models/move";
import { isPhysicalMove } from "../models/move";
import type { BaseStats } from "../models/stats";

/**
 * Burn status effect
 * 
 * Effects:
 * - HP loss: 1/16 of max HP per turn
 * - Physical damage reduction: 0.5x multiplier
 */

/**
 * Calculate HP loss from burn status
 * @param maxHP - Maximum HP of the Pokemon
 * @returns HP to lose (minimum 1)
 */
export function getBurnHPLoss(maxHP: number): number {
  const loss = Math.floor(maxHP / 16);
  return Math.max(1, loss);
}

/**
 * Modify damage dealt by a burned Pokemon
 * Physical moves are reduced to 0.5x, special moves are unaffected
 */
export function modifyBurnDamage(
  damage: number,
  move: Move
): number {
  if (isPhysicalMove(move)) {
    return Math.floor(damage * 0.5);
  }
  return damage;
}

/**
 * Check if burn affects damage for a move
 */
export function burnAffectsDamage(move: Move): boolean {
  return isPhysicalMove(move);
}



