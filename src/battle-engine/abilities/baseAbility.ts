import type { BattleState } from "../state";
import type { Move } from "../models/move";

/**
 * Ability hook interface
 * Abilities can implement these hooks to react to battle events
 */
export interface AbilityHooks {
  /**
   * Called when Pokemon enters battle
   */
  onEnterBattle?(
    state: BattleState,
    pokemonIndex: 0 | 1
  ): BattleState | null;

  /**
   * Called when Pokemon takes damage
   */
  onTakeDamage?(
    state: BattleState,
    pokemonIndex: 0 | 1,
    damage: number
  ): BattleState | null;

  /**
   * Called when Pokemon deals damage
   */
  onDealDamage?(
    state: BattleState,
    pokemonIndex: 0 | 1,
    damage: number
  ): BattleState | null;

  /**
   * Called when Pokemon faints
   */
  onFaint?(
    state: BattleState,
    pokemonIndex: 0 | 1
  ): BattleState | null;

  /**
   * Modify a stat value (passive stat modification)
   */
  modifyStat?(
    state: BattleState,
    pokemonIndex: 0 | 1,
    statName: string,
    value: number
  ): number;

  /**
   * Modify damage dealt by a move
   */
  modifyDamage?(
    state: BattleState,
    pokemonIndex: 0 | 1,
    move: Move,
    damage: number
  ): number;
}

/**
 * Base ability interface
 */
export interface Ability {
  name: string;
  hooks: AbilityHooks;
}

/**
 * Create an ability
 */
export function createAbility(
  name: string,
  hooks: AbilityHooks
): Ability {
  return {
    name,
    hooks,
  };
}

