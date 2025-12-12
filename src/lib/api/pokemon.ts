import { z } from "zod";
import {
  Pokemon,
  PokemonListResponse,
  PokemonTypeResponse,
  PokemonSchema,
  PokemonListResponseSchema,
  PokemonTypeResponseSchema,
} from "@/types/api";
import { fetchAPI } from "./fetchAPI";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Fetch a paginated list of Pokémon
 * @param offset - Starting index (default: 0)
 * @param limit - Number of items to fetch (default: 20)
 */
export async function getPokemonList(
  offset = 0,
  limit = 20
): Promise<PokemonListResponse> {
  const url = `${POKEAPI_BASE_URL}/pokemon?offset=${offset}&limit=${limit}`;
  return fetchAPI(url, PokemonListResponseSchema);
}

/**
 * Fetch a single Pokémon by ID or name
 * @param id - Pokémon ID or name
 */
export async function getPokemonById(id: string | number): Promise<Pokemon> {
  const url = `${POKEAPI_BASE_URL}/pokemon/${id}`;
  return fetchAPI(url, PokemonSchema);
}

/**
 * Fetch all Pokémon list (for search functionality)
 * This fetches the complete list without pagination
 */
export async function getAllPokemonList(): Promise<PokemonListResponse> {
  // PokéAPI has around 1000+ Pokémon, so we use a high limit
  const url = `${POKEAPI_BASE_URL}/pokemon?offset=0&limit=2000`;
  return fetchAPI(url, PokemonListResponseSchema);
}

/**
 * Fetch all Pokémon types
 */
export async function getPokemonTypes(): Promise<PokemonTypeResponse[]> {
  const url = `${POKEAPI_BASE_URL}/type?limit=20`;
  const response = await fetchAPI(
    url,
    z.object({
      count: z.number(),
      next: z.string().nullable(),
      previous: z.string().nullable(),
      results: z.array(
        z.object({
          name: z.string(),
          url: z.string().url(),
        })
      ),
    })
  );

  // Fetch details for each type
  const typeDetails = await Promise.all(
    response.results.map((type) =>
      fetchAPI(type.url, PokemonTypeResponseSchema)
    )
  );

  return typeDetails;
}

/**
 * Search Pokémon by name (client-side filtering from list)
 * This is a helper function for client-side search
 */
export function searchPokemonByName(
  pokemonList: Pokemon[],
  query: string
): Pokemon[] {
  if (!query.trim()) return pokemonList;

  const lowerQuery = query.toLowerCase().trim();
  return pokemonList.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Filter Pokémon by types
 * This is a helper function for client-side filtering
 */
export function filterPokemonByTypes(
  pokemonList: Pokemon[],
  selectedTypes: string[]
): Pokemon[] {
  if (selectedTypes.length === 0) return pokemonList;

  return pokemonList.filter((pokemon) =>
    pokemon.types.some((typeSlot) =>
      selectedTypes.includes(typeSlot.type.name)
    )
  );
}

