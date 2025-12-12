import { z } from "zod";
import {
  Move,
  MoveListResponse,
  MoveSchema,
  MoveListResponseSchema,
} from "@/types/api";
import { fetchAPI } from "./fetchAPI";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Fetch a paginated list of moves
 * @param offset - Starting index (default: 0)
 * @param limit - Number of items to fetch (default: 20)
 */
export async function getMoveList(
  offset = 0,
  limit = 20
): Promise<MoveListResponse> {
  const url = `${POKEAPI_BASE_URL}/move?offset=${offset}&limit=${limit}`;
  return fetchAPI(url, MoveListResponseSchema);
}

/**
 * Fetch a single move by ID or name
 * @param id - Move ID or name
 */
export async function getMoveById(id: string | number): Promise<Move> {
  const url = `${POKEAPI_BASE_URL}/move/${id}`;
  return fetchAPI(url, MoveSchema);
}

/**
 * Fetch a move by name
 * @param name - Move name
 */
export async function getMoveByName(name: string): Promise<Move> {
  return getMoveById(name.toLowerCase());
}

