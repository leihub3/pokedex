"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Pokemon as APIPokemon } from "@/types/api";
import { useBattle, type UseBattleReturn } from "./useBattle";
import { getPokemonById } from "@/lib/api/pokemon";
import { getPokemonMoves } from "@/lib/pokemon-api/normalizeForBattle";
import type { EliteFourConfig, EliteFourMember, EliteFourChampion } from "@/data/eliteFour";
import type { Move as EngineMove } from "@/battle-engine";

export type EliteFourStatus = "lobby" | "battling" | "defeated" | "victory";

export interface UseEliteFourReturn {
  // State
  status: EliteFourStatus;
  currentOpponentIndex: number | null; // 0-3 for members, 4 for champion, null when not battling
  userPokemon: APIPokemon | null;
  config: EliteFourConfig | null;
  defeatedOpponents: string[]; // IDs of defeated opponents
  currentOpponent: EliteFourMember | EliteFourChampion | null;
  opponentPokemon: APIPokemon | null;
  
  // Battle hook instance
  battle: UseBattleReturn;
  
  // Actions
  startRun: (userPokemon: APIPokemon, config: EliteFourConfig, selectedMoves?: EngineMove[]) => Promise<void>;
  startNextBattle: () => Promise<void>;
  onBattleWin: () => void;
  onBattleLoss: () => void;
  resetRun: () => void;
  
  // Getters
  isChampionBattle: () => boolean;
  getCurrentOpponentTitle: () => string | null;
}

/**
 * Custom hook for managing Elite Four challenge
 * Orchestrates sequential battles using the battle engine
 */
export function useEliteFour(): UseEliteFourReturn {
  const [status, setStatus] = useState<EliteFourStatus>("lobby");
  const [currentOpponentIndex, setCurrentOpponentIndex] = useState<number | null>(null);
  const [userPokemon, setUserPokemon] = useState<APIPokemon | null>(null);
  const [config, setConfig] = useState<EliteFourConfig | null>(null);
  const [defeatedOpponents, setDefeatedOpponents] = useState<string[]>([]);
  const [opponentPokemon, setOpponentPokemon] = useState<APIPokemon | null>(null);
  const [userSelectedMoves, setUserSelectedMoves] = useState<EngineMove[] | null>(null);
  
  // Use battle hook for individual battles
  const battle = useBattle();
  
  // Track if we've already processed this battle result to prevent duplicate processing
  const battleProcessedRef = useRef<string | null>(null);
  // Track the last processed opponent index to ensure we only process the current battle
  const lastProcessedOpponentIndexRef = useRef<number | null>(null);
  
  /**
   * Get current opponent (member or champion)
   */
  const getCurrentOpponent = useCallback((): EliteFourMember | EliteFourChampion | null => {
    if (!config || currentOpponentIndex === null) return null;
    
    if (currentOpponentIndex < config.members.length) {
      return config.members[currentOpponentIndex];
    } else if (currentOpponentIndex === config.members.length) {
      return config.champion;
    }
    
    return null;
  }, [config, currentOpponentIndex]);
  
  /**
   * Start Elite Four challenge
   */
  const startRun = useCallback(
    async (pokemon: APIPokemon, eliteFourConfig: EliteFourConfig, selectedMoves?: EngineMove[]) => {
      setUserPokemon(pokemon);
      setConfig(eliteFourConfig);
      setDefeatedOpponents([]);
      setOpponentPokemon(null);
      setCurrentOpponentIndex(0);
      setUserSelectedMoves(selectedMoves || null);
      setStatus("battling");
      // Battle will start via useEffect when currentOpponentIndex changes
    },
    []
  );
  
  /**
   * Start battle with current opponent
   */
  const startNextBattle = useCallback(async () => {
    if (!config || currentOpponentIndex === null || !userPokemon) return;
    
    const opponent = getCurrentOpponent();
    if (!opponent) return;
    
    try {
      // Reset opponent Pokemon state first
      setOpponentPokemon(null);
      
      // Reset battle processed tracker for new battle
      // Don't reset lastProcessedOpponentIndexRef - it should remain at previous opponent
      battleProcessedRef.current = null;
      
      // Fetch opponent's Pokemon
      const opponentPoke = await getPokemonById(opponent.pokemonId);
      setOpponentPokemon(opponentPoke);
      
      // Reset battle hook for fresh battle (ensures HP resets)
      battle.resetBattle();
      
      // Get opponent moves (always fetch, user might have selected moves)
      const opponentMoves = await getPokemonMoves(opponentPoke, 4);
      
      // Start battle - user is always pokemon1 (index 0)
      // Use selected moves for user if available, otherwise battle will fetch automatically
      const seed = Date.now() + currentOpponentIndex;
      await battle.startBattle(
        userPokemon, 
        opponentPoke, 
        seed,
        userSelectedMoves || undefined,
        opponentMoves.length > 0 ? opponentMoves : undefined
      );
      
      console.log("✓ Started battle for opponent index:", currentOpponentIndex, opponent.title);
    } catch (error) {
      console.error("Failed to start Elite Four battle:", error);
    }
  }, [config, currentOpponentIndex, userPokemon, userSelectedMoves, battle, getCurrentOpponent]);
  
  /**
   * Handle battle win - advance to next opponent or complete challenge
   */
  const onBattleWin = useCallback(() => {
    if (!config || currentOpponentIndex === null) {
      console.warn("onBattleWin called without config or currentOpponentIndex");
      return;
    }
    
    const opponent = getCurrentOpponent();
    if (!opponent) {
      console.warn("onBattleWin: Could not get current opponent");
      return;
    }
    
    // Debug logging
    console.log("onBattleWin:", {
      currentOpponentIndex,
      membersLength: config.members.length,
      opponentId: opponent.id,
      opponentTitle: opponent.title,
      isChampion: currentOpponentIndex === config.members.length
    });
    
    // Add opponent to defeated list
    setDefeatedOpponents((prev) => {
      // Prevent duplicate additions
      if (prev.includes(opponent.id)) {
        return prev;
      }
      return [...prev, opponent.id];
    });
    
    // Check if this was the champion
    // Champion is at index = members.length (which is 4 for 4 members)
    // Members are at indices 0, 1, 2, 3 (Lorelei, Bruno, Agatha, Lance)
    // Champion is at index 4 (Blue)
    // So we need: currentOpponentIndex === 4 to show victory
    const membersCount = config.members.length; // Should be 4
    const isChampion = currentOpponentIndex === membersCount;
    
    console.log("Victory check:", {
      currentOpponentIndex,
      membersCount,
      isChampion,
      condition: `${currentOpponentIndex} === ${membersCount}`
    });
    
    if (isChampion) {
      // Defeated Champion - Victory!
      console.log("✓ Champion defeated! Showing victory screen.");
      setStatus("victory");
    } else if (currentOpponentIndex < membersCount) {
      // Not the champion yet - continue to next opponent
      // This is an Elite Four member (index 0, 1, 2, or 3)
      console.log(`→ Moving to next opponent. Current index: ${currentOpponentIndex}, Next index: ${currentOpponentIndex + 1}`);
      
      // Reset opponent Pokemon to trigger useEffect for next battle
      setOpponentPokemon(null);
      
      // Advance to next opponent (useEffect will start next battle)
      const nextIndex = currentOpponentIndex + 1;
      
      // Use functional updates to avoid stale state
      setCurrentOpponentIndex((prevIndex) => {
        if (prevIndex !== currentOpponentIndex) {
          console.warn(`currentOpponentIndex mismatch: prev=${prevIndex}, current=${currentOpponentIndex}`);
        }
        return nextIndex;
      });
      
      // Explicitly ensure status remains "battling" 
      setStatus((prevStatus) => {
        if (prevStatus !== "battling") {
          console.warn(`Status was ${prevStatus}, forcing to 'battling'`);
        }
        return "battling";
      });
    } else {
      // Invalid state - opponent index is out of bounds
      console.error("Invalid opponent index:", {
        currentOpponentIndex,
        membersCount,
        message: "Opponent index is greater than members.length + 1"
      });
      setStatus("defeated"); // Fallback to defeated state
    }
  }, [config, currentOpponentIndex, getCurrentOpponent]);
  
  /**
   * Handle battle loss - end the run
   */
  const onBattleLoss = useCallback(() => {
    setStatus("defeated");
  }, []);
  
  /**
   * Reset to lobby state
   */
  const resetRun = useCallback(() => {
    setStatus("lobby");
    setCurrentOpponentIndex(null);
    setUserPokemon(null);
    setConfig(null);
    setDefeatedOpponents([]);
    setOpponentPokemon(null);
    setUserSelectedMoves(null);
    battleProcessedRef.current = null; // Reset processed battles tracker
    lastProcessedOpponentIndexRef.current = null; // Reset last processed opponent index
    battle.resetBattle();
  }, [battle]);
  
  /**
   * Check if current battle is against Champion
   */
  const isChampionBattle = useCallback((): boolean => {
    if (!config || currentOpponentIndex === null) return false;
    return currentOpponentIndex === config.members.length;
  }, [config, currentOpponentIndex]);
  
  /**
   * Get current opponent's title
   */
  const getCurrentOpponentTitle = useCallback((): string | null => {
    const opponent = getCurrentOpponent();
    return opponent?.title || null;
  }, [getCurrentOpponent]);
  
  // Monitor battle completion - only process if battle is finished AND it's for the current opponent
  useEffect(() => {
    if (status !== "battling") {
      return;
    }
    
    if (currentOpponentIndex === null) {
      return;
    }
    
    if (!battle.battleState) {
      return;
    }
    
    // CRITICAL CHECK: Ensure we have opponent Pokemon for current opponent
    // This ensures the battle has actually started for this opponent
    if (!opponentPokemon) {
      // Battle hasn't started yet for this opponent, don't process
      return;
    }
    
    // Get current opponent to verify this battle is for the right opponent
    const currentOpponent = getCurrentOpponent();
    if (!currentOpponent || opponentPokemon.id !== currentOpponent.pokemonId) {
      // Battle Pokemon doesn't match current opponent - this is an old battle
      console.log("Battle Pokemon doesn't match current opponent, skipping", {
        battlePokemonId: opponentPokemon.id,
        currentOpponentId: currentOpponent?.pokemonId,
        currentOpponentIndex
      });
      return;
    }
    
    if (!battle.isBattleFinished()) {
      return;
    }
    
    // CRITICAL: Only process if this battle is for the CURRENT opponent index
    // This prevents processing old battles when opponent index changes
    if (lastProcessedOpponentIndexRef.current === currentOpponentIndex) {
      console.log("Battle for opponent index already processed, skipping:", currentOpponentIndex);
      return;
    }
    
    const winnerIndex = battle.getWinner();
    if (winnerIndex === null) {
      return;
    }
    
    // Create a unique key for this battle to prevent duplicate processing
    const battleKey = `${currentOpponentIndex}-${battle.battleState?.turnNumber || 0}-${battle.battleState?.log.length || 0}`;
    if (battleProcessedRef.current === battleKey) {
      // Already processed this exact battle result
      console.log("Battle already processed, skipping:", battleKey);
      return;
    }
    
    console.log("Processing battle completion:", {
      battleKey,
      winnerIndex,
      currentOpponentIndex,
      lastProcessedIndex: lastProcessedOpponentIndexRef.current,
      opponentPokemonId: opponentPokemon.id,
      status
    });
    
    // Mark this battle as processed for THIS opponent index
    battleProcessedRef.current = battleKey;
    lastProcessedOpponentIndexRef.current = currentOpponentIndex;
    
    // User is always pokemon1 (index 0)
    if (winnerIndex === 0) {
      // User won
      console.log("User won the battle, calling onBattleWin");
      onBattleWin();
    } else {
      // User lost
      console.log("User lost the battle, calling onBattleLoss");
      onBattleLoss();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, battle.battleState, battle.isBattleFinished, battle.getWinner, onBattleWin, onBattleLoss, currentOpponentIndex, opponentPokemon?.id]);
  
  // Start battle when opponent index changes and we have all required data
  useEffect(() => {
    if (status !== "battling") {
      return;
    }
    
    if (currentOpponentIndex === null) {
      return;
    }
    
    if (!userPokemon || !config) {
      return;
    }
    
    // We need to start a new battle if we don't have opponentPokemon yet
    // OR if the battle is finished for the previous opponent and we've moved to next
    const shouldStartBattle = !opponentPokemon || 
      (battle.battle && battle.isBattleFinished() && lastProcessedOpponentIndexRef.current !== currentOpponentIndex);
    
    if (!shouldStartBattle) {
      return;
    }
    
    // Don't start if already loading
    if (battle.isLoading) {
      return;
    }
    
    // Don't start if battle exists and is in progress
    if (battle.battle && !battle.isBattleFinished()) {
      return;
    }
    
    console.log("useEffect: Triggering startNextBattle for opponent index:", currentOpponentIndex);
    
    // Use a timeout to avoid calling in render
    const timer = setTimeout(() => {
      startNextBattle();
    }, 100);
    return () => clearTimeout(timer);
  }, [status, currentOpponentIndex, userPokemon, config, opponentPokemon, battle.battle, battle.isLoading, battle.isBattleFinished, startNextBattle]);
  
  return {
    status,
    currentOpponentIndex,
    userPokemon,
    config,
    defeatedOpponents,
    currentOpponent: getCurrentOpponent(),
    opponentPokemon,
    battle,
    startRun,
    startNextBattle,
    onBattleWin,
    onBattleLoss,
    resetRun,
    isChampionBattle,
    getCurrentOpponentTitle,
  };
}

