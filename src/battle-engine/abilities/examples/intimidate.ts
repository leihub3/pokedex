import { createAbility } from "../baseAbility";
import { registerAbility } from "../registry";
import type { BattleState } from "../../state";
import { updateActivePokemon, addBattleEvent } from "../../state";
import { modifyStatStage } from "../../mechanics/statStages";

/**
 * Intimidate ability
 * Lowers opponent's attack by 1 stage when Pokemon enters battle
 */

const intimidateAbility = createAbility("intimidate", {
  onEnterBattle(state: BattleState, pokemonIndex: 0 | 1): BattleState | null {
    const opponentIndex = pokemonIndex === 0 ? 1 : 0;
    const opponent = state.activePokemon[opponentIndex];

    // Lower opponent's attack by 1 stage
    const newStatStages = modifyStatStage(
      opponent.statStages,
      "attack",
      -1
    );

    let newState = updateActivePokemon(state, opponentIndex, {
      statStages: newStatStages,
    });

    // Log the stat change
    newState = addBattleEvent(newState, {
      type: "stat_changed",
      pokemonIndex: opponentIndex,
      stat: "attack",
      oldStage: opponent.statStages.attack,
      newStage: newStatStages.attack,
    });

    return newState;
  },
});

// Register the ability
registerAbility(intimidateAbility);

