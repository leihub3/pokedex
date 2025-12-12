import { z } from "zod";
import {
  EvolutionChain,
  EvolutionChainSchema,
} from "@/types/api";
import { fetchAPI } from "./fetchAPI";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Fetch an evolution chain by ID
 * @param id - Evolution chain ID
 */
export async function getEvolutionChainById(id: number): Promise<EvolutionChain> {
  const url = `${POKEAPI_BASE_URL}/evolution-chain/${id}`;
  return fetchAPI(url, EvolutionChainSchema);
}

/**
 * Extract evolution chain ID from species URL
 * @param speciesUrl - Species API URL
 * @returns EvolutionChain or null if no evolution chain exists
 */
export async function getEvolutionChainFromSpecies(
  speciesUrl: string
): Promise<EvolutionChain | null> {
  try {
    // First fetch species to get evolution chain URL
    const { fetchWithTimeout } = await import("./fetchWithTimeout");
    const speciesResponse = await fetchWithTimeout(
      speciesUrl,
      {
        next: { revalidate: 3600 },
      },
      30000,
      2
    );
    if (!speciesResponse.ok) {
      console.warn("Failed to fetch species:", speciesUrl);
      return null;
    }
    const speciesData = await speciesResponse.json();
    const evolutionChainUrl = speciesData.evolution_chain?.url;
    
    if (!evolutionChainUrl) {
      // Some Pokémon don't have evolution chains (e.g., some legendaries, single-stage Pokémon)
      return null;
    }

    // Extract ID from URL
    const match = evolutionChainUrl.match(/\/evolution-chain\/(\d+)\//);
    if (!match) {
      console.warn("Invalid evolution chain URL:", evolutionChainUrl);
      return null;
    }

    const chainId = parseInt(match[1], 10);
    return getEvolutionChainById(chainId);
  } catch (error) {
    console.error("Error fetching evolution chain from species:", error);
    return null;
  }
}

