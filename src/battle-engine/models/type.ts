/**
 * Type constants and helpers
 * Reuses the existing typeEffectiveness utility from the codebase
 */

export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

/**
 * Normalize a type string to a valid PokemonType
 */
export function normalizeType(type: string): PokemonType {
  const normalized = type.toLowerCase();
  const validTypes: PokemonType[] = [
    "normal", "fire", "water", "electric", "grass", "ice",
    "fighting", "poison", "ground", "flying", "psychic", "bug",
    "rock", "ghost", "dragon", "dark", "steel", "fairy"
  ];

  if (validTypes.includes(normalized as PokemonType)) {
    return normalized as PokemonType;
  }

  // Default to normal if type is invalid
  return "normal";
}

