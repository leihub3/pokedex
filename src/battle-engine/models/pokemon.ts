import type { Pokemon as APIPokemon } from "@/types/api";
import type { BaseStats } from "./stats";
import { normalizeType, type PokemonType } from "./type";

/**
 * Normalized Pokemon model for battle engine
 */
export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  baseStats: BaseStats;
  ability: string; // Ability name for lookup
}

/**
 * Normalize a PokéAPI Pokemon to battle engine Pokemon
 */
export function normalizePokemon(apiPokemon: APIPokemon, abilityName?: string): Pokemon {
  // Extract base stats
  const baseStats: BaseStats = {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };

  for (const stat of apiPokemon.stats) {
    const statName = stat.stat.name;
    switch (statName) {
      case "hp":
        baseStats.hp = stat.base_stat;
        break;
      case "attack":
        baseStats.attack = stat.base_stat;
        break;
      case "defense":
        baseStats.defense = stat.base_stat;
        break;
      case "special-attack":
        baseStats.specialAttack = stat.base_stat;
        break;
      case "special-defense":
        baseStats.specialDefense = stat.base_stat;
        break;
      case "speed":
        baseStats.speed = stat.base_stat;
        break;
    }
  }

  // Extract types
  const types = apiPokemon.types
    .sort((a, b) => a.slot - b.slot)
    .map((t) => normalizeType(t.type.name));

  // Get ability (use provided or first non-hidden ability, or first ability)
  let ability = abilityName;
  if (!ability) {
    const nonHiddenAbility = apiPokemon.abilities.find((a) => !a.is_hidden);
    ability = nonHiddenAbility?.ability.name ?? apiPokemon.abilities[0]?.ability.name ?? "none";
  }

  return {
    id: apiPokemon.id,
    name: apiPokemon.name,
    types: types as PokemonType[],
    baseStats,
    ability,
  };
}

/**
 * Check if Pokemon has a specific type
 */
export function hasType(pokemon: Pokemon, type: PokemonType): boolean {
  return pokemon.types.includes(type);
}

/**
 * Check if Pokemon has STAB (Same Type Attack Bonus) for a move type
 */
export function hasSTAB(pokemon: Pokemon, moveType: PokemonType): boolean {
  return hasType(pokemon, moveType);
}

