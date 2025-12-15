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
 * Johto Elite Four configuration
 * Based on Pokemon Gold/Silver/Crystal
 */
export const JOHTO_ELITE_FOUR: EliteFourConfig = {
  id: "johto",
  name: "Johto Elite Four",
  members: [
    { id: "will", name: "Will", type: "psychic", pokemonId: 196, title: "Elite Four Will" }, // Espeon
    { id: "koga-johto", name: "Koga", type: "poison", pokemonId: 89, title: "Elite Four Koga" }, // Muk
    { id: "bruno-johto", name: "Bruno", type: "fighting", pokemonId: 68, title: "Elite Four Bruno" }, // Machamp
    { id: "karen", name: "Karen", type: "dark", pokemonId: 197, title: "Elite Four Karen" }, // Umbreon
  ],
  champion: { id: "lance-johto", name: "Lance", pokemonId: 149, title: "Champion Lance" }, // Dragonite
};

/**
 * Hoenn Elite Four configuration
 * Based on Pokemon Ruby/Sapphire/Emerald
 */
export const HOENN_ELITE_FOUR: EliteFourConfig = {
  id: "hoenn",
  name: "Hoenn Elite Four",
  members: [
    { id: "sidney", name: "Sidney", type: "dark", pokemonId: 359, title: "Elite Four Sidney" }, // Absol
    { id: "phoebe", name: "Phoebe", type: "ghost", pokemonId: 356, title: "Elite Four Phoebe" }, // Dusclops
    { id: "glacia", name: "Glacia", type: "ice", pokemonId: 362, title: "Elite Four Glacia" }, // Glalie
    { id: "drake", name: "Drake", type: "dragon", pokemonId: 373, title: "Elite Four Drake" }, // Salamence
  ],
  champion: { id: "steven", name: "Steven", pokemonId: 376, title: "Champion Steven" }, // Metagross
};

/**
 * Sinnoh Elite Four configuration
 * Based on Pokemon Diamond/Pearl/Platinum
 */
export const SINNOH_ELITE_FOUR: EliteFourConfig = {
  id: "sinnoh",
  name: "Sinnoh Elite Four",
  members: [
    { id: "aaron", name: "Aaron", type: "bug", pokemonId: 452, title: "Elite Four Aaron" }, // Drapion
    { id: "bertha", name: "Bertha", type: "ground", pokemonId: 450, title: "Elite Four Bertha" }, // Hippowdon
    { id: "flint", name: "Flint", type: "fire", pokemonId: 392, title: "Elite Four Flint" }, // Infernape
    { id: "lucian", name: "Lucian", type: "psychic", pokemonId: 65, title: "Elite Four Lucian" }, // Alakazam
  ],
  champion: { id: "cynthia", name: "Cynthia", pokemonId: 445, title: "Champion Cynthia" }, // Garchomp
};

/**
 * Unova Elite Four configuration
 * Based on Pokemon Black/White
 */
export const UNOVA_ELITE_FOUR: EliteFourConfig = {
  id: "unova",
  name: "Unova Elite Four",
  members: [
    { id: "shauntal", name: "Shauntal", type: "ghost", pokemonId: 609, title: "Elite Four Shauntal" }, // Chandelure
    { id: "marshal", name: "Marshal", type: "fighting", pokemonId: 534, title: "Elite Four Marshal" }, // Conkeldurr
    { id: "grimsley", name: "Grimsley", type: "dark", pokemonId: 625, title: "Elite Four Grimsley" }, // Bisharp
    { id: "caitlin", name: "Caitlin", type: "psychic", pokemonId: 579, title: "Elite Four Caitlin" }, // Reuniclus
  ],
  champion: { id: "alder", name: "Alder", pokemonId: 637, title: "Champion Alder" }, // Volcarona
};

/**
 * Kalos Elite Four configuration
 * Based on Pokemon X/Y
 */
export const KALOS_ELITE_FOUR: EliteFourConfig = {
  id: "kalos",
  name: "Kalos Elite Four",
  members: [
    { id: "malva", name: "Malva", type: "fire", pokemonId: 668, title: "Elite Four Malva" }, // Pyroar
    { id: "siebold", name: "Siebold", type: "water", pokemonId: 693, title: "Elite Four Siebold" }, // Clawitzer
    { id: "wikstrom", name: "Wikstrom", type: "steel", pokemonId: 681, title: "Elite Four Wikstrom" }, // Aegislash
    { id: "drasna", name: "Drasna", type: "dragon", pokemonId: 691, title: "Elite Four Drasna" }, // Dragalge
  ],
  champion: { id: "diantha", name: "Diantha", pokemonId: 282, title: "Champion Diantha" }, // Gardevoir
};

/**
 * Get all available Elite Four configurations
 */
export function getAllEliteFourConfigs(): EliteFourConfig[] {
  return [
    KANTO_ELITE_FOUR,
    JOHTO_ELITE_FOUR,
    HOENN_ELITE_FOUR,
    SINNOH_ELITE_FOUR,
    UNOVA_ELITE_FOUR,
    KALOS_ELITE_FOUR,
  ];
}

/**
 * Get Elite Four config by ID
 */
export function getEliteFourConfig(id: string): EliteFourConfig | null {
  const configs = getAllEliteFourConfigs();
  return configs.find((config) => config.id === id) || null;
}

