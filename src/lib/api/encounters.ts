import { z } from "zod";
import {
  PokemonEncounter,
  PokemonEncounterSchema,
} from "@/types/api";
import { fetchAPI } from "./fetchAPI";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Fetch encounter locations for a Pokémon
 * @param id - Pokémon ID
 */
export async function getPokemonEncounters(
  id: number
): Promise<PokemonEncounter[]> {
  const url = `${POKEAPI_BASE_URL}/pokemon/${id}/encounters`;
  const schema = z.array(PokemonEncounterSchema);
  return fetchAPI(url, schema);
}

