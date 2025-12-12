import { z } from "zod";
import {
  Ability,
  AbilityListResponse,
  AbilitySchema,
  AbilityListResponseSchema,
} from "@/types/api";
import { fetchAPI } from "./fetchAPI";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Fetch a paginated list of abilities
 * @param offset - Starting index (default: 0)
 * @param limit - Number of items to fetch (default: 20)
 */
export async function getAbilityList(
  offset = 0,
  limit = 20
): Promise<AbilityListResponse> {
  const url = `${POKEAPI_BASE_URL}/ability?offset=${offset}&limit=${limit}`;
  return fetchAPI(url, AbilityListResponseSchema);
}

/**
 * Fetch a single ability by ID or name
 * @param id - Ability ID or name
 */
export async function getAbilityById(id: string | number): Promise<Ability> {
  const url = `${POKEAPI_BASE_URL}/ability/${id}`;
  return fetchAPI(url, AbilitySchema);
}

/**
 * Fetch an ability by name
 * @param name - Ability name
 */
export async function getAbilityByName(name: string): Promise<Ability> {
  return getAbilityById(name.toLowerCase());
}

