"use client";

import { useState, useCallback } from "react";
import type { Pokemon as APIPokemon } from "@/types/api";
import {
  createBattle,
  executeTurnInBattle,
  getBattleWinner,
  isBattleFinished,
  normalizePokemon,
  normalizeMove,
  type Battle,
  type BattleState,
  type ActivePokemon,
  type Move as EngineMove,
} from "@/battle-engine";
import { normalizePokemonForBattle, getPokemonMoves } from "@/lib/pokemon-api/normalizeForBattle";

export interface UseBattleReturn {
  battle: Battle | null;
  battleState: BattleState | null;
  isAnimating: boolean;
  currentTurn: number;
  pokemon1Moves: EngineMove[];
  pokemon2Moves: EngineMove[];
  isLoading: boolean;
  pokemon1Sprite: string | null;
  pokemon2Sprite: string | null;
  battleSeed: number | null;

  // Actions
  startBattle: (
    pokemon1: APIPokemon,
    pokemon2: APIPokemon,
    seed?: number,
    pokemon1Moves?: EngineMove[],
    pokemon2Moves?: EngineMove[]
  ) => Promise<void>;
  executeTurn: (move1Index: number, move2Index: number) => void;
  resetBattle: () => void;
  replayBattle: (pokemon1: APIPokemon, pokemon2: APIPokemon) => Promise<void>;

  // Getters
  getActivePokemon: (index: 0 | 1) => ActivePokemon | null;
  isBattleFinished: () => boolean;
  getWinner: () => number | null;
}

/**
 * Custom hook for managing battle state
 * Orchestrates battle engine without implementing battle logic
 */
export function useBattle(): UseBattleReturn {
  const [battle, setBattle] = useState<Battle | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pokemon1Moves, setPokemon1Moves] = useState<EngineMove[]>([]);
  const [pokemon2Moves, setPokemon2Moves] = useState<EngineMove[]>([]);
  const [pokemon1Sprite, setPokemon1Sprite] = useState<string | null>(null);
  const [pokemon2Sprite, setPokemon2Sprite] = useState<string | null>(null);
  const [battleSeed, setBattleSeed] = useState<number | null>(null);
  const [storedPokemon1, setStoredPokemon1] = useState<APIPokemon | null>(null);
  const [storedPokemon2, setStoredPokemon2] = useState<APIPokemon | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Start a new battle
   * Fetches moves and normalizes Pokemon data (or uses provided moves)
   */
  const startBattle = useCallback(
    async (
      apiPokemon1: APIPokemon,
      apiPokemon2: APIPokemon,
      seed?: number,
      providedMoves1?: EngineMove[],
      providedMoves2?: EngineMove[]
    ) => {
      setIsLoading(true);
      try {
        // Normalize Pokemon
        const enginePokemon1 = normalizePokemonForBattle(apiPokemon1);
        const enginePokemon2 = normalizePokemonForBattle(apiPokemon2);

        // Use provided moves if available, otherwise fetch moves
        let moves1: EngineMove[];
        let moves2: EngineMove[];

        if (providedMoves1 && providedMoves2) {
          // Use provided moves
          moves1 = providedMoves1;
          moves2 = providedMoves2;
        } else {
          // Fetch moves for both Pokemon
          const [fetchedMoves1, fetchedMoves2] = await Promise.all([
            getPokemonMoves(apiPokemon1, 4),
            getPokemonMoves(apiPokemon2, 4),
          ]);
          moves1 = fetchedMoves1;
          moves2 = fetchedMoves2;
        }

        // Ensure we have at least one move per Pokemon
        if (moves1.length === 0 || moves2.length === 0) {
          throw new Error("Pokemon must have at least one move");
        }

        // Create battle using engine
        const newBattle = createBattle(
          enginePokemon1,
          enginePokemon2,
          seed ?? Date.now()
        );

        // Store sprite URLs for UI
        const sprite1 =
          apiPokemon1.sprites.other["official-artwork"].front_default ||
          apiPokemon1.sprites.front_default ||
          null;
        const sprite2 =
          apiPokemon2.sprites.other["official-artwork"].front_default ||
          apiPokemon2.sprites.front_default ||
          null;

      const usedSeed = seed ?? Date.now();

      setBattle(newBattle);
      setBattleState(newBattle.state);
      setPokemon1Moves(moves1);
      setPokemon2Moves(moves2);
      setPokemon1Sprite(sprite1);
      setPokemon2Sprite(sprite2);
      setBattleSeed(usedSeed);
      setStoredPokemon1(apiPokemon1);
      setStoredPokemon2(apiPokemon2);
      setIsAnimating(false);
      } catch (error) {
        console.error("Error starting battle:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Execute a turn
   * Takes move indices and executes turn using battle engine
   */
  const executeTurn = useCallback(
    (move1Index: number, move2Index: number) => {
      if (!battle || !pokemon1Moves.length || !pokemon2Moves.length) {
        return;
      }

      // Get moves by index
      const move1 = pokemon1Moves[move1Index];
      const move2 = pokemon2Moves[move2Index];

      if (!move1 || !move2) {
        console.error("Invalid move indices");
        return;
      }

      setIsAnimating(true);

      // Execute turn using engine
      const newBattle = executeTurnInBattle(battle, move1, move2);

      setBattle(newBattle);
      setBattleState(newBattle.state);

      // Animation will be handled by animation hook
      // Set animating to false after a delay to allow animations
      setTimeout(() => {
        setIsAnimating(false);
      }, 1500); // Allow time for damage/status animations
    },
    [battle, pokemon1Moves, pokemon2Moves]
  );

  /**
   * Reset battle state
   */
  const resetBattle = useCallback(() => {
    setBattle(null);
    setBattleState(null);
    setPokemon1Moves([]);
    setPokemon2Moves([]);
    setPokemon1Sprite(null);
    setPokemon2Sprite(null);
    setBattleSeed(null);
    setStoredPokemon1(null);
    setStoredPokemon2(null);
    setIsAnimating(false);
  }, []);

  /**
   * Replay battle with same seed
   */
  const replayBattle = useCallback(
    async (pokemon1: APIPokemon, pokemon2: APIPokemon) => {
      if (battleSeed === null) {
        // No previous battle to replay
        await startBattle(pokemon1, pokemon2);
        return;
      }

      // Replay with same seed
      await startBattle(pokemon1, pokemon2, battleSeed);
    },
    [battleSeed, startBattle]
  );

  /**
   * Get active Pokemon by index
   */
  const getActivePokemon = useCallback(
    (index: 0 | 1): ActivePokemon | null => {
      if (!battleState) return null;
      return battleState.activePokemon[index] ?? null;
    },
    [battleState]
  );

  /**
   * Check if battle is finished
   */
  const isBattleFinishedCheck = useCallback((): boolean => {
    if (!battle) return false;
    return isBattleFinished(battle);
  }, [battle]);

  /**
   * Get winner
   */
  const getWinnerCheck = useCallback((): number | null => {
    if (!battle) return null;
    return getBattleWinner(battle);
  }, [battle]);

  return {
    battle,
    battleState,
    isAnimating,
    currentTurn: battleState?.turnNumber ?? 0,
    pokemon1Moves,
    pokemon2Moves,
    pokemon1Sprite,
    pokemon2Sprite,
    battleSeed,
    isLoading,
    startBattle,
    executeTurn,
    resetBattle,
    replayBattle,
    getActivePokemon,
    isBattleFinished: isBattleFinishedCheck,
    getWinner: getWinnerCheck,
  };
}

