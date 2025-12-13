/**
 * Base stats structure for a Pokemon
 */
export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

/**
 * Stat stage modifiers (range: -6 to +6)
 */
export interface StatStages {
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  accuracy: number;
  evasion: number;
}

/**
 * Create initial stat stages (all at 0)
 */
export function createStatStages(): StatStages {
  return {
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
    accuracy: 0,
    evasion: 0,
  };
}

/**
 * Clone stat stages
 */
export function cloneStatStages(stages: StatStages): StatStages {
  return { ...stages };
}

/**
 * Stat stage multipliers (Gen 8+ formula)
 * Stage -6: 2/8 = 0.25
 * Stage -5: 2/7 ≈ 0.286
 * Stage -4: 2/6 ≈ 0.333
 * Stage -3: 2/5 = 0.4
 * Stage -2: 2/4 = 0.5
 * Stage -1: 2/3 ≈ 0.667
 * Stage  0: 2/2 = 1.0
 * Stage +1: 3/2 = 1.5
 * Stage +2: 4/2 = 2.0
 * Stage +3: 5/2 = 2.5
 * Stage +4: 6/2 = 3.0
 * Stage +5: 7/2 = 3.5
 * Stage +6: 8/2 = 4.0
 */
export function getStatStageMultiplier(stage: number): number {
  // Clamp stage to valid range
  const clampedStage = Math.max(-6, Math.min(6, stage));

  if (clampedStage === 0) {
    return 1.0;
  }

  if (clampedStage > 0) {
    return (2 + clampedStage) / 2;
  } else {
    return 2 / (2 - clampedStage);
  }
}

/**
 * Calculate actual stat value from base stat and stage
 */
export function calculateStatValue(baseStat: number, stage: number): number {
  const multiplier = getStatStageMultiplier(stage);
  return Math.floor(baseStat * multiplier);
}

