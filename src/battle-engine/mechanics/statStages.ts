import { clamp } from "../utils/clamp";
import type { StatStages } from "../models/stats";
import {
  getStatStageMultiplier,
  calculateStatValue,
  type BaseStats,
} from "../models/stats";

/**
 * Clamp stat stage to valid range (-6 to +6)
 */
export function clampStatStage(stage: number): number {
  return clamp(stage, -6, 6);
}

/**
 * Modify a stat stage by a delta amount (clamped to valid range)
 */
export function modifyStatStage(
  stages: StatStages,
  statName: keyof StatStages,
  delta: number
): StatStages {
  const newStages = { ...stages };
  newStages[statName] = clampStatStage(stages[statName] + delta);
  return newStages;
}

/**
 * Set a stat stage to a specific value (clamped to valid range)
 */
export function setStatStage(
  stages: StatStages,
  statName: keyof StatStages,
  value: number
): StatStages {
  const newStages = { ...stages };
  newStages[statName] = clampStatStage(value);
  return newStages;
}

/**
 * Get the multiplier for a specific stat stage
 */
export function getStatMultiplier(stage: number): number {
  return getStatStageMultiplier(stage);
}

/**
 * Calculate actual stat value from base stat and stage
 */
export function getEffectiveStat(baseStat: number, stage: number): number {
  return calculateStatValue(baseStat, stage);
}

/**
 * Get all effective stats for a Pokemon
 */
export function getEffectiveStats(
  baseStats: BaseStats,
  stages: StatStages
): BaseStats {
  return {
    hp: baseStats.hp, // HP is not affected by stat stages
    attack: getEffectiveStat(baseStats.attack, stages.attack),
    defense: getEffectiveStat(baseStats.defense, stages.defense),
    specialAttack: getEffectiveStat(
      baseStats.specialAttack,
      stages.specialAttack
    ),
    specialDefense: getEffectiveStat(
      baseStats.specialDefense,
      stages.specialDefense
    ),
    speed: getEffectiveStat(baseStats.speed, stages.speed),
  };
}



