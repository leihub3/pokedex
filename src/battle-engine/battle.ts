import type { Pokemon } from "./models/pokemon";
import type { Move } from "./models/move";
import type { BattleState, BattleEvent } from "./state";
import {
  createBattleState,
  getWinner,
  isBattleOver,
} from "./state";
import { executeTurn } from "./engine";
import { getAbility } from "./abilities/registry";
import { addBattleEvent } from "./state";

/**
 * Battle instance
 * Wraps battle state with convenience methods
 */
export interface Battle {
  state: BattleState;
}

/**
 * Create a new battle
 * @param pokemon1 - First Pokemon
 * @param pokemon2 - Second Pokemon
 * @param seed - Optional seed for deterministic battles. If not provided, uses random seed.
 * @returns Battle instance
 */
export function createBattle(
  pokemon1: Pokemon,
  pokemon2: Pokemon,
  seed?: number
): Battle {
  const battleSeed = seed ?? Date.now();
  const state = createBattleState(pokemon1, pokemon2, battleSeed);

  let newState = state;

  // Trigger onEnterBattle abilities
  for (let i = 0; i < 2; i++) {
    const pokemonIndex = i === 0 ? 0 : 1;
    const active = newState.activePokemon[pokemonIndex];
    const ability = getAbility(active.pokemon.ability);

    if (ability?.hooks.onEnterBattle) {
      const result = ability.hooks.onEnterBattle(newState, pokemonIndex);
      if (result) {
        newState = result;
      }
    }
  }

  return {
    state: newState,
  };
}

/**
 * Execute a turn in the battle
 * @param battle - Battle instance
 * @param move1 - Move for first Pokemon (pokemon1)
 * @param move2 - Move for second Pokemon (pokemon2)
 * @returns New battle instance with updated state
 */
export function executeTurnInBattle(
  battle: Battle,
  move1: Move,
  move2: Move
): Battle {
  const newState = executeTurn(battle.state, move1, move2);

  return {
    state: newState,
  };
}

/**
 * Get the winner of the battle
 * @param battle - Battle instance
 * @returns Winner index (0 or 1), or null if battle is not over
 */
export function getBattleWinner(battle: Battle): number | null {
  return getWinner(battle.state);
}

/**
 * Check if battle is over
 */
export function isBattleFinished(battle: Battle): boolean {
  return isBattleOver(battle.state);
}

/**
 * Get battle log
 */
export function getBattleLog(battle: Battle): BattleEvent[] {
  return battle.state.log;
}



