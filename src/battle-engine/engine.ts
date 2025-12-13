import { SeededRNG } from "./rng";
import type { BattleState } from "./state";
import type { Move } from "./models/move";
import { checkAccuracy } from "./mechanics/accuracy";
import { calculateDamage } from "./mechanics/damage";
import { determineTurnOrder } from "./mechanics/priority";
import { canAct, applyStatusHPLoss, processStatusTurn } from "./effects";
import { getAbility } from "./abilities/registry";
import {
  updateActivePokemon,
  addBattleEvent,
  isFainted,
  getWinner,
  cloneBattleState,
} from "./state";

/**
 * Execute a single turn of battle
 * Returns new battle state
 */
export function executeTurn(
  state: BattleState,
  move1: Move,
  move2: Move
): BattleState {
  // Clone state for immutability
  let newState = cloneBattleState(state);

  // Check if battle is already over
  if (isFainted(newState.activePokemon[0]) || isFainted(newState.activePokemon[1])) {
    return newState;
  }

  // Create RNG from seed (for determinism)
  const rng = new SeededRNG(newState.seed + newState.turnNumber);

  // Increment turn number
  newState = {
    ...newState,
    turnNumber: newState.turnNumber + 1,
  };

  // Log turn start
  newState = addBattleEvent(newState, {
    type: "turn_start",
    turnNumber: newState.turnNumber,
  });

  // Determine turn order
  const turnOrder = determineTurnOrder(
    [move1, move2],
    [newState.activePokemon[0].pokemon, newState.activePokemon[1].pokemon],
    [newState.activePokemon[0].statStages, newState.activePokemon[1].statStages]
  );
  const firstIndex: 0 | 1 = turnOrder[0];
  const secondIndex: 0 | 1 = turnOrder[1];

  const firstMove = firstIndex === 0 ? move1 : move2;
  const secondMove = secondIndex === 0 ? move1 : move2;

  // Execute first Pokemon's action
  newState = executePokemonAction(
    newState,
    firstIndex,
    firstIndex === 0 ? move1 : move2,
    secondIndex,
    rng
  );

  // Check if battle ended after first action
  if (isFainted(newState.activePokemon[0]) || isFainted(newState.activePokemon[1])) {
    const winner = getWinner(newState);
    if (winner !== null) {
      newState = {
        ...newState,
        winner,
      };
      newState = addBattleEvent(newState, {
        type: "faint",
        pokemonIndex: winner === 0 ? 1 : 0,
      });
    }
    return newState;
  }

  // Execute second Pokemon's action
  newState = executePokemonAction(
    newState,
    secondIndex,
    secondIndex === 0 ? move1 : move2,
    firstIndex,
    rng
  );

  // Check for faints after both actions
  const faint0 = isFainted(newState.activePokemon[0]);
  const faint1 = isFainted(newState.activePokemon[1]);

  if (faint0 || faint1) {
    const winner = getWinner(newState);
    if (winner !== null) {
      newState = {
        ...newState,
        winner,
      };
      newState = addBattleEvent(newState, {
        type: "faint",
        pokemonIndex: winner === 0 ? 1 : 0,
      });
    }
  } else {
    // Apply end-of-turn status effects
    newState = applyEndOfTurnStatusEffects(newState, rng);
  }

  // Log turn end
  newState = addBattleEvent(newState, {
    type: "turn_end",
    turnNumber: newState.turnNumber,
  });

  return newState;
}

/**
 * Execute a single Pokemon's action in a turn
 */
function executePokemonAction(
  state: BattleState,
  attackerIndex: 0 | 1,
  move: Move,
  defenderIndex: 0 | 1,
  rng: SeededRNG
): BattleState {
  let newState = state;
  const attacker = state.activePokemon[attackerIndex];
  const defender = state.activePokemon[defenderIndex];

  // Check if Pokemon can act (sleep, paralysis)
  if (!canAct(attacker.status, rng)) {
    // Pokemon cannot act (sleep or paralyzed)
    return newState;
  }

  // Log move used
  newState = addBattleEvent(newState, {
    type: "move_used",
    pokemonIndex: attackerIndex,
    moveName: move.name,
  });

  // Check accuracy (for damaging moves)
  if (move.power !== null && move.power > 0) {
    if (!checkAccuracy(move, rng)) {
      // Move missed
      newState = addBattleEvent(newState, {
        type: "move_missed",
        pokemonIndex: attackerIndex,
        moveName: move.name,
      });
      return newState;
    }

    // Calculate damage
    let damage = calculateDamage(
      attacker.pokemon,
      defender.pokemon,
      move,
      attacker.statStages,
      defender.statStages,
      attacker.status,
      rng
    );

    // Apply ability damage modifiers (attacker)
    const attackerAbility = getAbility(attacker.pokemon.ability);
    if (attackerAbility?.hooks.modifyDamage) {
      damage = attackerAbility.hooks.modifyDamage(
        newState,
        attackerIndex,
        move,
        damage
      );
    }

    // Apply damage
    const newHP = Math.max(0, defender.currentHP - damage);
    newState = updateActivePokemon(newState, defenderIndex, {
      currentHP: newHP,
    });

    // Log damage dealt
    newState = addBattleEvent(newState, {
      type: "damage_dealt",
      pokemonIndex: defenderIndex,
      damage,
      remainingHP: newHP,
    });

    // Trigger ability hooks (onTakeDamage for defender, onDealDamage for attacker)
    const defenderAbility = getAbility(defender.pokemon.ability);
    if (defenderAbility?.hooks.onTakeDamage) {
      const abilityResult = defenderAbility.hooks.onTakeDamage(
        newState,
        defenderIndex,
        damage
      );
      if (abilityResult) {
        newState = abilityResult;
      }
    }

    if (attackerAbility?.hooks.onDealDamage) {
      const abilityResult = attackerAbility.hooks.onDealDamage(
        newState,
        attackerIndex,
        damage
      );
      if (abilityResult) {
        newState = abilityResult;
      }
    }
  }

  // Note: Status move application would go here (for future expansion)

  return newState;
}

/**
 * Apply end-of-turn status effects (burn/poison HP loss, sleep counter decrement)
 */
function applyEndOfTurnStatusEffects(
  state: BattleState,
  rng: SeededRNG
): BattleState {
  let newState = state;

  // Process status for both Pokemon
  for (let i = 0; i < 2; i++) {
    const pokemonIndex = i === 0 ? 0 : 1;
    const active = newState.activePokemon[pokemonIndex];

    // Apply status HP loss
    const hpLoss = applyStatusHPLoss(active.status, active.maxHP);
    if (hpLoss > 0) {
      const newHP = Math.max(0, active.currentHP - hpLoss);
      newState = updateActivePokemon(newState, pokemonIndex, {
        currentHP: newHP,
      });

      const statusType = active.status?.type ?? "unknown";
      newState = addBattleEvent(newState, {
        type: "status_damage",
        pokemonIndex,
        damage: hpLoss,
        remainingHP: newHP,
        statusType,
      });
    }

    // Process status turn (decrement sleep counter, etc.)
    const newStatus = processStatusTurn(active.status);
    if (newStatus !== active.status) {
      newState = updateActivePokemon(newState, pokemonIndex, {
        status: newStatus,
      });

      if (newStatus === null && active.status !== null) {
        // Status was removed (e.g., woke up from sleep)
        newState = addBattleEvent(newState, {
          type: "status_healed",
          pokemonIndex,
          status: null,
        });
      }
    }
  }

  return newState;
}

