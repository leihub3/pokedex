import { z } from "zod";
import {
  Location,
  LocationArea,
  Region,
  LocationListResponse,
  RegionListResponse,
  LocationSchema,
  LocationAreaSchema,
  RegionSchema,
  LocationListResponseSchema,
  RegionListResponseSchema,
} from "@/types/api";
import { fetchAPI } from "./fetchAPI";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Fetch a paginated list of locations
 * @param offset - Starting index (default: 0)
 * @param limit - Number of items to fetch (default: 20)
 */
export async function getLocationList(
  offset = 0,
  limit = 20
): Promise<LocationListResponse> {
  const url = `${POKEAPI_BASE_URL}/location?offset=${offset}&limit=${limit}`;
  return fetchAPI(url, LocationListResponseSchema);
}

/**
 * Fetch a single location by ID or name
 * @param id - Location ID or name
 */
export async function getLocationById(id: string | number): Promise<Location> {
  const url = `${POKEAPI_BASE_URL}/location/${id}`;
  return fetchAPI(url, LocationSchema);
}

/**
 * Fetch a location area by ID or name
 * @param id - Location area ID or name
 */
export async function getLocationAreaById(
  id: string | number
): Promise<LocationArea> {
  const url = `${POKEAPI_BASE_URL}/location-area/${id}`;
  return fetchAPI(url, LocationAreaSchema);
}

/**
 * Fetch all regions
 */
export async function getRegionList(): Promise<RegionListResponse> {
  const url = `${POKEAPI_BASE_URL}/region`;
  return fetchAPI(url, RegionListResponseSchema);
}

/**
 * Fetch a single region by ID or name
 * @param id - Region ID or name
 */
export async function getRegionById(id: string | number): Promise<Region> {
  const url = `${POKEAPI_BASE_URL}/region/${id}`;
  return fetchAPI(url, RegionSchema);
}

