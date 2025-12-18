"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { BattleEvent, BattleState, ActivePokemon, Move } from "@/battle-engine";
import type { Effectiveness } from "@/lib/utils/battleHelpers";

export interface BattleStats {
  totalTurns: number;
  lastTurnComplete: boolean; // Whether the last turn had both Pokémon act (has turn_end event)
  damageDealt: { pokemon0: number; pokemon1: number };
  damageReceived: { pokemon0: number; pokemon1: number };
  movesUsed: Map<string, { count: number; pokemonIndex: number }>;
  criticalHits: { pokemon0: number; pokemon1: number };
  effectivenessCounts: Map<Effectiveness, number>;
  battleDuration: number; // in milliseconds
  hpHistory: Array<{ turn: number; pokemon0: number; pokemon1: number; timestamp: number }>;
  startTime: number;
  endTime: number | null;
}

interface UseBattleStatsOptions {
  battleState: BattleState | null;
  getActivePokemon: (index: 0 | 1) => ActivePokemon | null;
  pokemon1Moves: Move[];
  pokemon2Moves: Move[];
  calculateEffectiveness?: (moveType: string, defenderTypes: string[]) => Effectiveness;
}

export function useBattleStats({
  battleState,
  getActivePokemon,
  pokemon1Moves,
  pokemon2Moves,
  calculateEffectiveness,
}: UseBattleStatsOptions) {
  const [stats, setStats] = useState<BattleStats>({
    totalTurns: 0,
    lastTurnComplete: true,
    damageDealt: { pokemon0: 0, pokemon1: 0 },
    damageReceived: { pokemon0: 0, pokemon1: 0 },
    movesUsed: new Map(),
    criticalHits: { pokemon0: 0, pokemon1: 0 },
    effectivenessCounts: new Map(),
    battleDuration: 0,
    hpHistory: [],
    startTime: Date.now(),
    endTime: null,
  });

  const processedEventsRef = useRef<Set<number>>(new Set());
  const currentTurnMoveTypesRef = useRef<{
    move1Type: string | null;
    move2Type: string | null;
    move1Name: string | null;
    move2Name: string | null;
  }>({
    move1Type: null,
    move2Type: null,
    move1Name: null,
    move2Name: null,
  });

  // Heuristic: treat very high-damage hits as "critical hits"
  // We don't currently have an explicit critical flag from the battle engine,
  // so we approximate based on the fraction of max HP removed in a single hit.
  const isCriticalDamage = (damage: number, defender: ActivePokemon | null): boolean => {
    if (!defender || defender.maxHP <= 0) return false;
    const fraction = damage / defender.maxHP;
    // Consider it a critical hit if a single hit removes at least 35% of max HP
    return fraction >= 0.35;
  };

  // Track HP changes over time
  const trackHPHistory = useCallback((turn: number) => {
    const pokemon0 = getActivePokemon(0);
    const pokemon1 = getActivePokemon(1);
    
    if (pokemon0 && pokemon1) {
      setStats((prev) => ({
        ...prev,
        hpHistory: [
          ...prev.hpHistory,
          {
            turn,
            pokemon0: pokemon0.currentHP,
            pokemon1: pokemon1.currentHP,
            timestamp: Date.now(),
          },
        ],
      }));
    }
  }, [getActivePokemon]);

  // Process battle events
  useEffect(() => {
    if (!battleState) {
      // Reset stats when battle state is cleared
      setStats({
        totalTurns: 0,
        lastTurnComplete: true,
        damageDealt: { pokemon0: 0, pokemon1: 0 },
        damageReceived: { pokemon0: 0, pokemon1: 0 },
        movesUsed: new Map(),
        criticalHits: { pokemon0: 0, pokemon1: 0 },
        effectivenessCounts: new Map(),
        battleDuration: 0,
        hpHistory: [],
        startTime: Date.now(),
        endTime: null,
      });
      processedEventsRef.current.clear();
      currentTurnMoveTypesRef.current = {
        move1Type: null,
        move2Type: null,
        move1Name: null,
        move2Name: null,
      };
      return;
    }

    // Process new events
    battleState.log.forEach((event, index) => {
      if (processedEventsRef.current.has(index)) return;
      processedEventsRef.current.add(index);

      setStats((prev) => {
        const newStats = { ...prev };

        switch (event.type) {
          case "battle_start":
        newStats.startTime = Date.now();
        newStats.totalTurns = 0;
        newStats.lastTurnComplete = true;
        // Track initial HP
        trackHPHistory(0);
        break;

          case "turn_start":
            newStats.totalTurns = event.turnNumber;
            newStats.lastTurnComplete = false; // Assume incomplete until turn_end
            trackHPHistory(event.turnNumber);
            break;

          case "turn_end":
            // Turn completed - both Pokémon acted
            newStats.lastTurnComplete = true;
            break;

          case "move_used":
            {
              const moveKey = `${event.pokemonIndex}_${event.moveName}`;
              const existing = newStats.movesUsed.get(moveKey);
              if (existing) {
                newStats.movesUsed.set(moveKey, {
                  ...existing,
                  count: existing.count + 1,
                });
              } else {
                newStats.movesUsed.set(moveKey, {
                  count: 1,
                  pokemonIndex: event.pokemonIndex,
                });
              }

              // Track move type and name for effectiveness calculation
              const moves = event.pokemonIndex === 0 ? pokemon1Moves : pokemon2Moves;
              const move = moves.find((m) => m.name === event.moveName);
              
              if (event.pokemonIndex === 0) {
                currentTurnMoveTypesRef.current.move1Name = event.moveName;
                currentTurnMoveTypesRef.current.move1Type = move?.type || null;
              } else {
                currentTurnMoveTypesRef.current.move2Name = event.moveName;
                currentTurnMoveTypesRef.current.move2Type = move?.type || null;
              }
            }
            break;

          case "damage_dealt":
            {
              const attackerIndex = event.pokemonIndex === 0 ? 1 : 0;
              const defenderIndex = event.pokemonIndex;

              // Update damage dealt/received
              if (attackerIndex === 0) {
                newStats.damageDealt.pokemon0 += event.damage;
              } else {
                newStats.damageDealt.pokemon1 += event.damage;
              }

              if (defenderIndex === 0) {
                newStats.damageReceived.pokemon0 += event.damage;
              } else {
                newStats.damageReceived.pokemon1 += event.damage;
              }

              // Look up defender once for effectiveness + crit heuristics
              const defender = getActivePokemon(defenderIndex as 0 | 1);

              // Calculate effectiveness if function is provided
              if (calculateEffectiveness) {
                const moveType =
                  attackerIndex === 0
                    ? currentTurnMoveTypesRef.current.move1Type
                    : currentTurnMoveTypesRef.current.move2Type;

                if (moveType && defender) {
                  const effectiveness = calculateEffectiveness(
                    moveType,
                    defender.pokemon.types
                  );
                  const currentCount = newStats.effectivenessCounts.get(effectiveness) || 0;
                  newStats.effectivenessCounts.set(effectiveness, currentCount + 1);
                }
              }

              // Track "critical hits" using the same heuristic used for visuals
              if (isCriticalDamage(event.damage, defender)) {
                if (attackerIndex === 0) {
                  newStats.criticalHits.pokemon0 += 1;
                } else {
                  newStats.criticalHits.pokemon1 += 1;
                }
              }

              // Track HP after damage
              trackHPHistory(newStats.totalTurns);
            }
            break;

          case "faint":
            newStats.endTime = Date.now();
            newStats.battleDuration = newStats.endTime - newStats.startTime;
            trackHPHistory(newStats.totalTurns);
            // If faint happens, the turn may not have completed (no turn_end event)
            // lastTurnComplete will remain false if the battle ended early
            break;
        }

        return newStats;
      });
    });

    // Update battle duration if battle is ongoing
    if (!battleState.winner && battleState.log.length > 0) {
      setStats((prev) => ({
        ...prev,
        battleDuration: Date.now() - prev.startTime,
      }));
    }
  }, [battleState, getActivePokemon, pokemon1Moves, pokemon2Moves, calculateEffectiveness, trackHPHistory]);

  // Get most effective move
  const getMostEffectiveMove = useCallback(() => {
    let maxDamage = 0;
    let mostEffectiveMove: { name: string; pokemonIndex: number } | null = null;

    // This would require tracking move-to-damage relationships
    // For now, return the most used move
    const movesArray = Array.from(stats.movesUsed.entries());
    if (movesArray.length === 0) return null;

    const sortedByCount = movesArray.sort((a, b) => b[1].count - a[1].count);
    const [moveKey, moveData] = sortedByCount[0];
    const moveName = moveKey.split("_").slice(1).join("_");

    return {
      name: moveName,
      pokemonIndex: moveData.pokemonIndex,
      usageCount: moveData.count,
    };
  }, [stats.movesUsed]);

  // Get performance badges
  const getPerformanceBadges = useCallback(() => {
    const badges: string[] = [];

    // Fast Victory (won in < 3 turns)
    if (stats.totalTurns < 3) {
      badges.push("Fast Victory");
    }

    // Perfect Defense (took no damage)
    if (stats.damageReceived.pokemon0 === 0) {
      badges.push("Perfect Defense");
    }

    // Type Master (used super effective moves 5+ times)
    const superEffectiveCount = stats.effectivenessCounts.get(2) || 0;
    if (superEffectiveCount >= 5) {
      badges.push("Type Master");
    }

    // Critical Master (landed 3+ critical hits)
    const totalCrits = stats.criticalHits.pokemon0 + stats.criticalHits.pokemon1;
    if (totalCrits >= 3) {
      badges.push("Critical Master");
    }

    return badges;
  }, [stats]);

  return {
    stats,
    getMostEffectiveMove,
    getPerformanceBadges,
    reset: useCallback(() => {
      setStats({
        totalTurns: 0,
        lastTurnComplete: true,
        damageDealt: { pokemon0: 0, pokemon1: 0 },
        damageReceived: { pokemon0: 0, pokemon1: 0 },
        movesUsed: new Map(),
        criticalHits: { pokemon0: 0, pokemon1: 0 },
        effectivenessCounts: new Map(),
        battleDuration: 0,
        hpHistory: [],
        startTime: Date.now(),
        endTime: null,
      });
      processedEventsRef.current.clear();
      currentTurnMoveTypesRef.current = {
        move1Type: null,
        move2Type: null,
        move1Name: null,
        move2Name: null,
      };
    }, []),
  };
}

