import { z } from "zod";
import {
  Generation,
  GenerationListResponse,
  GenerationSchema,
  GenerationListResponseSchema,
} from "@/types/api";
import { fetchAPI } from "./fetchAPI";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Fetch all generations
 */
export async function getGenerationList(): Promise<GenerationListResponse> {
  const url = `${POKEAPI_BASE_URL}/generation`;
  return fetchAPI(url, GenerationListResponseSchema);
}

/**
 * Fetch a single generation by ID or name
 * @param id - Generation ID or name
 */
export async function getGenerationById(
  id: string | number
): Promise<Generation> {
  const url = `${POKEAPI_BASE_URL}/generation/${id}`;
  return fetchAPI(url, GenerationSchema);
}

