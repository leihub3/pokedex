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
 */
export async function getEvolutionChainFromSpecies(
  speciesUrl: string
): Promise<EvolutionChain> {
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
    throw new Error("Failed to fetch species");
  }
  const speciesData = await speciesResponse.json();
  const evolutionChainUrl = speciesData.evolution_chain?.url;
  
  if (!evolutionChainUrl) {
    throw new Error("No evolution chain found for this species");
  }

  // Extract ID from URL
  const match = evolutionChainUrl.match(/\/evolution-chain\/(\d+)\//);
  if (!match) {
    throw new Error("Invalid evolution chain URL");
  }

  const chainId = parseInt(match[1], 10);
  return getEvolutionChainById(chainId);
}

