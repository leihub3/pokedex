import type { Pokemon } from "@/types/api";

/**
 * Elite Four member configuration
 */
export interface EliteFourMember {
  id: string;
  name: string;
  type: string; // Pokemon type (ice, fighting, etc.)
  pokemonId: number; // PokeAPI Pokemon ID
  title: string; // e.g., "Elite Four Lorelei"
}

/**
 * Elite Four Champion configuration
 */
export interface EliteFourChampion {
  id: string;
  name: string;
  pokemonId: number;
  title: string; // e.g., "Champion Blue"
}

/**
 * Elite Four configuration for a region
 */
export interface EliteFourConfig {
  id: string; // e.g., "kanto"
  name: string; // e.g., "Kanto Elite Four"
  members: EliteFourMember[];
  champion: EliteFourChampion;
}

/**
 * Kanto Elite Four configuration
 * Based on the classic Pokemon games
 */
export const KANTO_ELITE_FOUR: EliteFourConfig = {
  id: "kanto",
  name: "Kanto Elite Four",
  members: [
    { id: "lorelei", name: "Lorelei", type: "ice", pokemonId: 131, title: "Elite Four Lorelei" }, // Lapras
    { id: "bruno", name: "Bruno", type: "fighting", pokemonId: 68, title: "Elite Four Bruno" }, // Machamp
    { id: "agatha", name: "Agatha", type: "ghost", pokemonId: 94, title: "Elite Four Agatha" }, // Gengar
    { id: "lance", name: "Lance", type: "dragon", pokemonId: 149, title: "Elite Four Lance" }, // Dragonite
  ],
  champion: { id: "blue", name: "Blue", pokemonId: 6, title: "Champion Blue" }, // Charizard
};

/**
 * Get all available Elite Four configurations
 */
export function getAllEliteFourConfigs(): EliteFourConfig[] {
  return [KANTO_ELITE_FOUR];
}

/**
 * Get Elite Four config by ID
 */
export function getEliteFourConfig(id: string): EliteFourConfig | null {
  const configs = getAllEliteFourConfigs();
  return configs.find((config) => config.id === id) || null;
}

