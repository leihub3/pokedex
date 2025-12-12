import { z } from "zod";
import {
  Species,
  SpeciesSchema,
} from "@/types/api";
import { fetchAPI } from "./fetchAPI";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Fetch a Pokémon species by ID
 * @param id - Species ID
 */
export async function getSpeciesById(id: number): Promise<Species> {
  const url = `${POKEAPI_BASE_URL}/pokemon-species/${id}`;
  return fetchAPI(url, SpeciesSchema);
}

/**
 * Fetch a Pokémon species by name
 * @param name - Species name
 */
export async function getSpeciesByName(name: string): Promise<Species> {
  const url = `${POKEAPI_BASE_URL}/pokemon-species/${name.toLowerCase()}`;
  return fetchAPI(url, SpeciesSchema);
}

/**
 * Fetch a Pokémon species by URL
 * @param speciesUrl - Species API URL
 */
export async function getSpeciesByUrl(speciesUrl: string): Promise<Species> {
  return fetchAPI(speciesUrl, SpeciesSchema);
}

