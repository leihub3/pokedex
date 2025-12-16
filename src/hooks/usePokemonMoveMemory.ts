import { useState, useEffect, useCallback } from "react";
import type { Move as APIMove } from "@/types/api";
import type { Move as EngineMove } from "@/battle-engine";

interface SavedMoveSelection {
  pokemonId: number;
  pokemonName?: string; // Store Pokemon name for easier retrieval (optional for backward compatibility)
  moveIds: number[];
  timestamp: number;
}

const STORAGE_KEY = "pokemon-elite-four-move-selections";
const RECENT_POKEMON_KEY = "pokemon-elite-four-recent-pokemon";
const LAST_POKEMON_KEY = "pokemon-elite-four-last-pokemon";

/**
 * Hook to manage Pokemon move selection memory
 * Stores previous move selections in localStorage
 */
export function usePokemonMoveMemory() {
  const [savedSelections, setSavedSelections] = useState<Map<number, SavedMoveSelection>>(new Map());

  // Load saved selections from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as SavedMoveSelection[];
        const map = new Map<number, SavedMoveSelection>();
        data.forEach((selection) => {
          map.set(selection.pokemonId, selection);
        });
        setSavedSelections(map);
      }
    } catch (error) {
      console.error("Error loading saved move selections:", error);
    }
  }, []);

  /**
   * Get previously selected moves for a Pokemon
   */
  const getSavedMoves = useCallback(
    (pokemonId: number): number[] | null => {
      const selection = savedSelections.get(pokemonId);
      return selection ? selection.moveIds : null;
    },
    [savedSelections]
  );

  /**
   * Get previously selected moves as APIMove objects (filtered from available moves)
   */
  const getSavedMovesAsAPIMoves = useCallback(
    (pokemonId: number, availableMoves: APIMove[]): APIMove[] => {
      const savedMoveIds = getSavedMoves(pokemonId);
      if (!savedMoveIds || savedMoveIds.length === 0) {
        return [];
      }
      
      // Filter available moves to only include saved moves
      return availableMoves.filter((move) => savedMoveIds.includes(move.id));
    },
    [getSavedMoves]
  );

  /**
   * Save last selected Pokemon name
   */
  const saveLastPokemon = useCallback((pokemonName: string) => {
    try {
      localStorage.setItem(LAST_POKEMON_KEY, pokemonName);
    } catch (error) {
      console.error("Error saving last Pokemon:", error);
    }
  }, []);

  /**
   * Save move selection for a Pokemon
   */
  const saveMoves = useCallback(
    (pokemonId: number, moveIds: number[]) => {
      try {
        const newSelection: SavedMoveSelection = {
          pokemonId,
          moveIds,
          timestamp: Date.now(),
          // pokemonName will be added when using saveMovesFromEngineMoves
        };

        const updated = new Map(savedSelections);
        updated.set(pokemonId, newSelection);
        setSavedSelections(updated);

        // Save to localStorage
        const array = Array.from(updated.values());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
      } catch (error) {
        console.error("Error saving move selection:", error);
      }
    },
    [savedSelections]
  );

  /**
   * Save move selection from EngineMove objects
   */
  const saveMovesFromEngineMoves = useCallback(
    (pokemonId: number, pokemonName: string, moves: EngineMove[]) => {
      // Extract move IDs from EngineMove objects
      // Note: EngineMove has an id property
      const moveIds = moves.map((move) => move.id);
      
      // Save moves with Pokemon name
      try {
        const newSelection: SavedMoveSelection = {
          pokemonId,
          pokemonName,
          moveIds,
          timestamp: Date.now(),
        };

        const updated = new Map(savedSelections);
        updated.set(pokemonId, newSelection);
        setSavedSelections(updated);

        // Save to localStorage
        const array = Array.from(updated.values());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
      } catch (error) {
        console.error("Error saving move selection:", error);
      }

      // Also save to recent Pokemon list
      try {
        const recentStorage = localStorage.getItem(RECENT_POKEMON_KEY);
        let recentPokemon: Array<{ id: number; name: string; timestamp: number }> = [];
        
        if (recentStorage) {
          recentPokemon = JSON.parse(recentStorage);
        }

        // Remove if already exists
        recentPokemon = recentPokemon.filter((p) => p.id !== pokemonId);
        
        // Add to beginning (most recent first)
        recentPokemon.unshift({ id: pokemonId, name: pokemonName, timestamp: Date.now() });
        
        // Keep only last 10
        recentPokemon = recentPokemon.slice(0, 10);
        
        localStorage.setItem(RECENT_POKEMON_KEY, JSON.stringify(recentPokemon));
      } catch (error) {
        console.error("Error saving recent Pokemon:", error);
      }

      // Also save as last Pokemon
      saveLastPokemon(pokemonName);
    },
    [savedSelections, saveLastPokemon]
  );

  /**
   * Get recently used Pokemon (sorted by most recent first)
   */
  const getRecentPokemon = useCallback((): Array<{ id: number; name: string; timestamp: number }> => {
    try {
      const recentStorage = localStorage.getItem(RECENT_POKEMON_KEY);
      if (recentStorage) {
        return JSON.parse(recentStorage);
      }
    } catch (error) {
      console.error("Error loading recent Pokemon:", error);
    }
    return [];
  }, []);

  /**
   * Get last selected Pokemon name
   */
  const getLastPokemon = useCallback((): string | null => {
    try {
      return localStorage.getItem(LAST_POKEMON_KEY);
    } catch (error) {
      console.error("Error loading last Pokemon:", error);
      return null;
    }
  }, []);

  /**
   * Clear saved moves for a specific Pokemon
   */
  const clearSavedMoves = useCallback(
    (pokemonId: number) => {
      try {
        const updated = new Map(savedSelections);
        updated.delete(pokemonId);
        setSavedSelections(updated);

        const array = Array.from(updated.values());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
      } catch (error) {
        console.error("Error clearing move selection:", error);
      }
    },
    [savedSelections]
  );

  /**
   * Clear all saved moves
   */
  const clearAllSavedMoves = useCallback(() => {
    try {
      setSavedSelections(new Map());
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing all move selections:", error);
    }
  }, []);

  return {
    getSavedMoves,
    getSavedMovesAsAPIMoves,
    saveMoves,
    saveMovesFromEngineMoves,
    clearSavedMoves,
    clearAllSavedMoves,
    hasSavedMoves: (pokemonId: number) => savedSelections.has(pokemonId),
    getRecentPokemon,
    saveLastPokemon,
    getLastPokemon,
  };
}

