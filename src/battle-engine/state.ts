import type { Pokemon } from "./models/pokemon";
import type { StatusCondition } from "./models/status";
import { createStatStages, type StatStages } from "./models/stats";
import type { BaseStats } from "./models/stats";

/**
 * Active Pokemon in battle
 * Contains current battle state for a single Pokemon
 */
export interface ActivePokemon {
  pokemon: Pokemon;
  currentHP: number;
  maxHP: number;
  status: StatusCondition | null;
  statStages: StatStages;
  volatileEffects: Record<string, unknown>; // For future expansion (confusion, etc.)
}

/**
 * Battle event types
 */
export type BattleEvent =
  | { type: "turn_start"; turnNumber: number }
  | { type: "move_used"; pokemonIndex: number; moveName: string }
  | { type: "move_missed"; pokemonIndex: number; moveName: string }
  | { type: "damage_dealt"; pokemonIndex: number; damage: number; remainingHP: number }
  | { type: "status_applied"; pokemonIndex: number; status: StatusCondition }
  | { type: "status_damage"; pokemonIndex: number; damage: number; remainingHP: number; statusType: string }
  | { type: "status_healed"; pokemonIndex: number; status: StatusCondition | null }
  | { type: "stat_changed"; pokemonIndex: number; stat: string; oldStage: number; newStage: number }
  | { type: "faint"; pokemonIndex: number }
  | { type: "turn_end"; turnNumber: number }
  | { type: "battle_start"; pokemon1: string; pokemon2: string; seed: number };

/**
 * Battle state
 * Immutable state structure representing the current battle state
 */
export interface BattleState {
  turnNumber: number;
  activePokemon: [ActivePokemon, ActivePokemon];
  log: BattleEvent[];
  seed: number;
  winner: number | null; // 0 or 1, or null if battle is ongoing
}

/**
 * Create an ActivePokemon from a Pokemon model
 */
export function createActivePokemon(pokemon: Pokemon): ActivePokemon {
  const maxHP = pokemon.baseStats.hp;
  return {
    pokemon,
    currentHP: maxHP,
    maxHP,
    status: null,
    statStages: createStatStages(),
    volatileEffects: {},
  };
}

/**
 * Create initial battle state
 */
export function createBattleState(
  pokemon1: Pokemon,
  pokemon2: Pokemon,
  seed: number
): BattleState {
  const active1 = createActivePokemon(pokemon1);
  const active2 = createActivePokemon(pokemon2);

  const state: BattleState = {
    turnNumber: 0,
    activePokemon: [active1, active2],
    log: [
      {
        type: "battle_start",
        pokemon1: pokemon1.name,
        pokemon2: pokemon2.name,
        seed,
      },
    ],
    seed,
    winner: null,
  };

  return state;
}

/**
 * Clone battle state (for immutability)
 */
export function cloneBattleState(state: BattleState): BattleState {
  return {
    turnNumber: state.turnNumber,
    activePokemon: [
      cloneActivePokemon(state.activePokemon[0]),
      cloneActivePokemon(state.activePokemon[1]),
    ],
    log: [...state.log],
    seed: state.seed,
    winner: state.winner,
  };
}

/**
 * Clone active Pokemon
 */
function cloneActivePokemon(active: ActivePokemon): ActivePokemon {
  return {
    pokemon: active.pokemon, // Pokemon is immutable
    currentHP: active.currentHP,
    maxHP: active.maxHP,
    status: active.status ? { ...active.status } : null,
    statStages: { ...active.statStages },
    volatileEffects: { ...active.volatileEffects },
  };
}

/**
 * Check if a Pokemon has fainted
 */
export function isFainted(active: ActivePokemon): boolean {
  return active.currentHP <= 0;
}

/**
 * Check if battle is over
 */
export function isBattleOver(state: BattleState): boolean {
  return (
    isFainted(state.activePokemon[0]) ||
    isFainted(state.activePokemon[1]) ||
    state.winner !== null
  );
}

/**
 * Get the winner index (0 or 1), or null if no winner
 */
export function getWinner(state: BattleState): number | null {
  if (state.winner !== null) {
    return state.winner;
  }

  const faint0 = isFainted(state.activePokemon[0]);
  const faint1 = isFainted(state.activePokemon[1]);

  if (faint0 && !faint1) {
    return 1;
  }
  if (faint1 && !faint0) {
    return 0;
  }

  return null;
}

/**
 * Add event to battle log
 */
export function addBattleEvent(
  state: BattleState,
  event: BattleEvent
): BattleState {
  return {
    ...state,
    log: [...state.log, event],
  };
}

/**
 * Update active Pokemon
 */
export function updateActivePokemon(
  state: BattleState,
  index: 0 | 1,
  updates: Partial<ActivePokemon>
): BattleState {
  const newActive = {
    ...state.activePokemon[index],
    ...updates,
  };

  const newActives: [ActivePokemon, ActivePokemon] = [
    index === 0 ? newActive : state.activePokemon[0],
    index === 1 ? newActive : state.activePokemon[1],
  ];

  return {
    ...state,
    activePokemon: newActives,
  };
}

