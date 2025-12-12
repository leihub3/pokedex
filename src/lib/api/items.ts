import { z } from "zod";
import {
  Item,
  ItemListResponse,
  ItemSchema,
  ItemListResponseSchema,
} from "@/types/api";
import { fetchAPI } from "./fetchAPI";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Fetch a paginated list of items
 * @param offset - Starting index (default: 0)
 * @param limit - Number of items to fetch (default: 20)
 */
export async function getItemList(
  offset = 0,
  limit = 20
): Promise<ItemListResponse> {
  const url = `${POKEAPI_BASE_URL}/item?offset=${offset}&limit=${limit}`;
  return fetchAPI(url, ItemListResponseSchema);
}

/**
 * Fetch a single item by ID or name
 * @param id - Item ID or name
 */
export async function getItemById(id: string | number): Promise<Item> {
  const url = `${POKEAPI_BASE_URL}/item/${id}`;
  return fetchAPI(url, ItemSchema);
}

/**
 * Fetch an item by name
 * @param name - Item name
 */
export async function getItemByName(name: string): Promise<Item> {
  return getItemById(name.toLowerCase());
}

