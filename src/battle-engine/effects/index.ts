import type { SeededRNG } from "../rng";
import type { StatusCondition } from "../models/status";
import type { Move } from "../models/move";
import type { BaseStats } from "../models/stats";
import { isStatus } from "../models/status";
import { getBurnHPLoss, modifyBurnDamage } from "./burn";
import { getPoisonHPLoss } from "./poison";
import {
  getParalysisSpeedMultiplier,
  canActWithParalysis,
} from "./paralysis";
import {
  canActWithSleep,
  processSleepTurn,
  generateSleepDuration,
} from "./sleep";

/**
 * Status effect registry and application functions
 */

/**
 * Check if a Pokemon can act given its status condition
 */
export function canAct(
  status: StatusCondition | null,
  rng: SeededRNG
): boolean {
  if (!status) {
    return true;
  }

  if (status.type === "sleep") {
    return canActWithSleep(status);
  }

  if (status.type === "paralysis") {
    return canActWithParalysis(rng);
  }

  return true; // Burn and poison don't prevent actions
}

/**
 * Get speed multiplier based on status condition
 */
export function getSpeedMultiplier(status: StatusCondition | null): number {
  if (isStatus(status, "paralysis")) {
    return getParalysisSpeedMultiplier();
  }
  return 1.0;
}

/**
 * Modify damage based on status condition
 * Note: Burn damage reduction is handled in damage calculation, not here
 * This is for other status-based damage modifiers (if needed)
 */
export function modifyDamageByStatus(
  damage: number,
  move: Move,
  attackerStatus: StatusCondition | null
): number {
  if (isStatus(attackerStatus, "burn")) {
    return modifyBurnDamage(damage, move);
  }
  return damage;
}

/**
 * Apply status effect HP loss at end of turn
 * Returns HP loss amount
 */
export function applyStatusHPLoss(
  status: StatusCondition | null,
  maxHP: number
): number {
  if (isStatus(status, "burn")) {
    return getBurnHPLoss(maxHP);
  }

  if (isStatus(status, "poison")) {
    return getPoisonHPLoss(maxHP);
  }

  return 0;
}

/**
 * Process status effects for end of turn
 * Returns new status condition (may be null if status ended)
 */
export function processStatusTurn(
  status: StatusCondition | null
): StatusCondition | null {
  if (!status) {
    return null;
  }

  if (status.type === "sleep") {
    return processSleepTurn(status);
  }

  // Burn, poison, and paralysis persist
  return status;
}

/**
 * Create a new status condition
 */
export function createStatus(
  type: "burn" | "poison" | "paralysis" | "sleep",
  rng?: SeededRNG
): StatusCondition {
  if (type === "sleep") {
    if (!rng) {
      throw new Error("RNG required for sleep status");
    }
    return {
      type: "sleep",
      turnsRemaining: generateSleepDuration(rng),
    };
  }

  return { type };
}

