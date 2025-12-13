/**
 * Pokémon Battle Engine
 * 
 * A deterministic, pure TypeScript battle engine for turn-based Pokémon battles.
 * This engine is framework-agnostic and can be consumed by any UI layer.
 * 
 * Features:
 * - Turn-based battle system
 * - Real damage calculation (Gen 8+ formula)
 * - Move accuracy & priority
 * - Type effectiveness
 * - Stat stages (buffs/debuffs)
 * - Status conditions (Burn, Poison, Paralysis, Sleep)
 * - Ability system (passive + triggered)
 * - Deterministic with seeded RNG
 * 
 * @example
 * ```typescript
 * import { createBattle, executeTurnInBattle, getBattleWinner, isBattleFinished } from '@/battle-engine';
 * import { normalizePokemon } from '@/battle-engine';
 * import { normalizeMove } from '@/battle-engine';
 * 
 * // Normalize Pokemon from PokéAPI data
 * const pokemon1 = normalizePokemon(apiPokemon1);
 * const pokemon2 = normalizePokemon(apiPokemon2);
 * 
 * // Create battle with seed for replayability
 * const battle = createBattle(pokemon1, pokemon2, 12345);
 * 
 * // Normalize moves
 * const move1 = normalizeMove(apiMove1);
 * const move2 = normalizeMove(apiMove2);
 * 
 * // Execute turns
 * let currentBattle = battle;
 * while (!isBattleFinished(currentBattle)) {
 *   currentBattle = executeTurnInBattle(currentBattle, move1, move2);
 * }
 * 
 * const winner = getBattleWinner(currentBattle);
 * ```
 */

// Import abilities to ensure they're registered
import "./abilities/index";

// Public API
export {
  createBattle,
  executeTurnInBattle,
  getBattleWinner,
  isBattleFinished,
  getBattleLog,
  type Battle,
} from "./battle";

// Models (for normalization from PokéAPI)
export {
  normalizePokemon,
  hasType,
  hasSTAB,
  type Pokemon,
} from "./models/pokemon";

export {
  normalizeMove,
  isDamagingMove,
  isPhysicalMove,
  isSpecialMove,
  type Move,
} from "./models/move";

export {
  createStatStages,
  cloneStatStages,
  getStatStageMultiplier,
  calculateStatValue,
  type BaseStats,
  type StatStages,
} from "./models/stats";

export {
  hasStatus,
  isStatus,
  cloneStatus,
  type StatusCondition,
} from "./models/status";

export { normalizeType, type PokemonType } from "./models/type";

// State types (for UI consumption)
export type {
  BattleState,
  BattleEvent,
  ActivePokemon,
} from "./state";

// RNG (for custom seed management)
export { SeededRNG } from "./rng";

