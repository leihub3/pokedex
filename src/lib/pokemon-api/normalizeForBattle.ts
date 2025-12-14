import type { Pokemon as APIPokemon, Move as APIMove } from "@/types/api";
import { normalizePokemon, normalizeMove } from "@/battle-engine";
import type { Pokemon as EnginePokemon, Move as EngineMove } from "@/battle-engine";
import { getMoveById } from "@/lib/api/moves";

/**
 * Normalize a PokéAPI Pokemon to battle engine Pokemon
 */
export function normalizePokemonForBattle(
  apiPokemon: APIPokemon,
  abilityName?: string
): EnginePokemon {
  return normalizePokemon(apiPokemon, abilityName);
}

/**
 * Normalize a PokéAPI Move to battle engine Move
 */
export function normalizeMoveForBattle(apiMove: APIMove): EngineMove {
  return normalizeMove(apiMove);
}

/**
 * Fetch and normalize a move by ID or name
 */
export async function fetchAndNormalizeMove(
  moveIdOrName: string | number
): Promise<EngineMove> {
  const apiMove = await getMoveById(moveIdOrName);
  return normalizeMoveForBattle(apiMove);
}

/**
 * Get first 4 moves from a Pokemon's move list
 * Fetches full move data for normalization
 */
export async function getPokemonMoves(
  apiPokemon: APIPokemon,
  limit: number = 4
): Promise<EngineMove[]> {
  const movesToFetch = apiPokemon.moves
    .filter((move) => move.version_group_details.length > 0)
    .slice(0, limit * 2); // Fetch more than needed in case some fail

  try {
    const movePromises = movesToFetch.map(async (moveEntry) => {
      try {
        const moveUrl = moveEntry.move.url;
        const moveId = moveUrl.split("/").filter(Boolean).pop();
        if (!moveId) {
          return null;
        }
        return await fetchAndNormalizeMove(moveId);
      } catch (error) {
        // Skip moves that fail to fetch
        console.warn(`Failed to fetch move: ${moveEntry.move.name}`, error);
        return null;
      }
    });

    const moves = (await Promise.all(movePromises)).filter(
      (move): move is EngineMove => move !== null
    );

    // Prefer moves with power > 0, but include at least some moves
    const damagingMoves = moves.filter((move) => move.power !== null && move.power > 0);
    
    if (damagingMoves.length >= limit) {
      return damagingMoves.slice(0, limit);
    }
    
    // If not enough damaging moves, include status moves
    return moves.slice(0, limit);
  } catch (error) {
    console.error("Error fetching Pokemon moves:", error);
    return [];
  }
}

/**
 * Get available moves for a Pokemon from the API (full Move objects, not normalized)
 * Returns moves with all properties including effect_entries, pp, effect_chance, etc.
 * @param pokemon - API Pokemon object
 * @param limit - Maximum number of moves to fetch (optional, fetches more if not specified)
 * @returns Array of full Move objects from API
 */
export async function getAvailablePokemonMoves(
  pokemon: APIPokemon,
  limit?: number
): Promise<APIMove[]> {
  const movesToFetch = pokemon.moves
    .filter((move) => move.version_group_details.length > 0);

  // If limit specified, only fetch up to limit * 2 (to account for failures)
  const movesList = limit 
    ? movesToFetch.slice(0, limit * 2)
    : movesToFetch;

  try {
    const movePromises = movesList.map(async (moveEntry) => {
      try {
        const moveUrl = moveEntry.move.url;
        const moveId = moveUrl.split("/").filter(Boolean).pop();
        if (!moveId) {
          return null;
        }
        // Fetch full Move object from API
        return await getMoveById(moveId);
      } catch (error) {
        // Skip moves that fail to fetch
        console.warn(`Failed to fetch move: ${moveEntry.move.name}`, error);
        return null;
      }
    });

    const moves = (await Promise.all(movePromises)).filter(
      (move): move is APIMove => move !== null
    );

    // If limit specified, return up to limit moves
    // Otherwise return all successfully fetched moves
    return limit ? moves.slice(0, limit) : moves;
  } catch (error) {
    console.error("Error fetching available Pokemon moves:", error);
    return [];
  }
}

