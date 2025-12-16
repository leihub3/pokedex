import { createAbility } from "../baseAbility";
import { registerAbility } from "../registry";
import type { BattleState } from "../../state";
import type { Move } from "../../models/move";

/**
 * Blaze ability
 * Boosts fire moves by 1.5x when HP is below 33%
 */

const HP_THRESHOLD = 0.33; // 33% of max HP
const DAMAGE_BOOST = 1.5;

const blazeAbility = createAbility("blaze", {
  modifyDamage(
    state: BattleState,
    pokemonIndex: 0 | 1,
    move: Move,
    damage: number
  ): number {
    const pokemon = state.activePokemon[pokemonIndex];

    // Check if HP is below threshold
    const hpPercentage = pokemon.currentHP / pokemon.maxHP;
    if (hpPercentage >= HP_THRESHOLD) {
      return damage; // No boost
    }

    // Check if move is fire type
    if (move.type !== "fire") {
      return damage; // Only affects fire moves
    }

    // Boost fire move damage
    return Math.floor(damage * DAMAGE_BOOST);
  },
});

// Register the ability
registerAbility(blazeAbility);



