import type { BaseStats } from "../models/stats";

/**
 * Poison status effect
 * 
 * Effects:
 * - HP loss: 1/16 of max HP per turn
 */

/**
 * Calculate HP loss from poison status
 * @param maxHP - Maximum HP of the Pokemon
 * @returns HP to lose (minimum 1)
 */
export function getPoisonHPLoss(maxHP: number): number {
  const loss = Math.floor(maxHP / 16);
  return Math.max(1, loss);
}



