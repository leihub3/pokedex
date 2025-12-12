import { getPokemonById, getAllPokemonList, getPokemonTypes, getPokemonByType } from "./pokemon";
import { getMoveById, getMoveList } from "./moves";
import { getAbilityById, getAbilityList } from "./abilities";
import { getSpeciesById, getSpeciesByName, getSpeciesByUrl } from "./species";
import { getEvolutionChainFromSpecies } from "./evolution";
import type { Pokemon, PokemonListItem, PokemonTypeResponse } from "@/types/api";
import type { Move } from "@/types/api";
import type { Ability } from "@/types/api";
import type { Species } from "@/types/api";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * Fetch type effectiveness data (damage relations)
 * Returns type data with damage relations for type effectiveness quizzes
 */
export async function fetchTypeEffectivenessData(
  typeName: string
): Promise<PokemonTypeResponse | null> {
  try {
    const types = await getPokemonTypes();
    return types.find((t) => t.name === typeName) || null;
  } catch (error) {
    console.error("Error fetching type effectiveness data:", error);
    return null;
  }
}

/**
 * Get all types for type effectiveness quiz
 */
export async function getAllTypes(): Promise<string[]> {
  try {
    const types = await getPokemonTypes();
    return types.map((t) => t.name);
  } catch (error) {
    console.error("Error fetching all types:", error);
    return [];
  }
}

/**
 * Get a random type for type effectiveness questions
 */
export async function getRandomType(): Promise<string | null> {
  const types = await getAllTypes();
  if (types.length === 0) return null;
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Fetch Pokemon abilities data for ability quiz
 * Returns ability with list of Pokemon that have it
 */
export async function fetchAbilityData(abilityName: string): Promise<Ability | null> {
  try {
    return await getAbilityById(abilityName.toLowerCase());
  } catch (error) {
    console.error("Error fetching ability data:", error);
    return null;
  }
}

/**
 * Get random ability for ability quiz
 */
export async function getRandomAbility(): Promise<Ability | null> {
  try {
    const abilities = await getAbilityList(0, 300); // Get a large batch
    if (abilities.results.length === 0) return null;
    
    const randomAbility = abilities.results[Math.floor(Math.random() * abilities.results.length)];
    return await getAbilityById(randomAbility.name);
  } catch (error) {
    console.error("Error getting random ability:", error);
    return null;
  }
}

/**
 * Fetch Pokemon that have a specific ability
 */
export async function getPokemonWithAbility(abilityName: string): Promise<PokemonListItem[]> {
  try {
    const ability = await fetchAbilityData(abilityName);
    if (!ability) return [];
    
    return ability.pokemon.map((entry) => entry.pokemon);
  } catch (error) {
    console.error("Error fetching Pokemon with ability:", error);
    return [];
  }
}

/**
 * Fetch move data for move quiz
 */
export async function fetchMoveData(moveName: string): Promise<Move | null> {
  try {
    return await getMoveById(moveName.toLowerCase());
  } catch (error) {
    console.error("Error fetching move data:", error);
    return null;
  }
}

/**
 * Get random move for move quiz
 */
export async function getRandomMove(): Promise<Move | null> {
  try {
    const moves = await getMoveList(0, 900); // Get a large batch
    if (moves.results.length === 0) return null;
    
    const randomMove = moves.results[Math.floor(Math.random() * moves.results.length)];
    return await getMoveById(randomMove.name);
  } catch (error) {
    console.error("Error getting random move:", error);
    return null;
  }
}

/**
 * Fetch species data (for Pokedex descriptions, habitat, legendary status, etc.)
 */
export async function fetchSpeciesData(pokemonId: number): Promise<Species | null> {
  try {
    return await getSpeciesById(pokemonId);
  } catch (error) {
    // Silently handle 404s - some Pokemon don't have species entries
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return null;
    }
    // Only log non-404 errors
    if (!(error instanceof Error && error.message === "NOT_FOUND")) {
      console.error("Error fetching species data:", error);
    }
    return null;
  }
}

/**
 * Fetch species data by Pokemon name (more reliable than ID)
 */
export async function fetchSpeciesDataByName(pokemonName: string): Promise<Species | null> {
  try {
    return await getSpeciesByName(pokemonName);
  } catch (error) {
    // Silently handle 404s - some Pokemon don't have species entries
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return null;
    }
    return null;
  }
}

/**
 * Fetch species data from a Pokemon object (most reliable method)
 * Uses the species URL from the Pokemon object directly
 */
export async function fetchSpeciesDataFromPokemon(pokemon: Pokemon): Promise<Species | null> {
  try {
    // First try to use the species URL from the Pokemon object (most reliable)
    if (pokemon.species?.url) {
      const { getSpeciesByUrl } = await import("./species");
      return await getSpeciesByUrl(pokemon.species.url);
    }
    
    // Fallback: try by name (remove form suffixes like -mega, -gmax, -alola, etc.)
    const baseName = pokemon.name.split('-')[0]; // Get base name (e.g., "pikachu" from "pikachu-gmax")
    return await fetchSpeciesDataByName(baseName);
  } catch (error) {
    // Silently handle 404s - some Pokemon don't have species entries
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return null;
    }
    return null;
  }
}

/**
 * Get Pokedex flavor text for a Pokemon (English)
 */
export async function getPokemonFlavorText(pokemonId: number): Promise<string | null> {
  try {
    const species = await fetchSpeciesData(pokemonId);
    if (!species) return null;
    
    // Find English flavor text
    const englishEntry = species.flavor_text_entries.find(
      (entry) => entry.language.name === "en"
    );
    
    return englishEntry?.flavor_text || null;
  } catch (error) {
    console.error("Error getting flavor text:", error);
    return null;
  }
}

/**
 * Get random Pokemon with flavor text for Pokedex quiz
 */
export async function getRandomPokemonWithFlavorText(): Promise<{
  pokemon: Pokemon;
  flavorText: string;
} | null> {
  try {
    const allPokemon = await getAllPokemonList();
    if (allPokemon.results.length === 0) return null;
    
    // Try a few random Pokemon until we find one with flavor text
    for (let i = 0; i < 10; i++) {
      const randomPokemon = allPokemon.results[Math.floor(Math.random() * allPokemon.results.length)];
      const match = randomPokemon.url.match(/\/pokemon\/(\d+)\//);
      if (!match) continue;
      
      const pokemonId = parseInt(match[1], 10);
      const flavorText = await getPokemonFlavorText(pokemonId);
      
      if (flavorText) {
        const pokemon = await getPokemonById(pokemonId);
        return { pokemon, flavorText };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error getting random Pokemon with flavor text:", error);
    return null;
  }
}

/**
 * Get Pokemon generation from species
 */
export async function getPokemonGeneration(
  pokemonId: number,
  pokemonName?: string,
  pokemon?: Pokemon
): Promise<string | null> {
  try {
    // Try to get species from Pokemon object first (most reliable)
    let species: Species | null = null;
    if (pokemon) {
      species = await fetchSpeciesDataFromPokemon(pokemon);
    }
    
    // Fallback: try by name (remove form suffixes)
    if (!species && pokemonName) {
      const baseName = pokemonName.split('-')[0];
      species = await fetchSpeciesDataByName(baseName);
    }
    
    // Final fallback: try by ID
    if (!species) {
      species = await fetchSpeciesData(pokemonId);
    }
    
    if (!species) return null;
    
    // Generation name is like "generation-i", "generation-ii", etc.
    return species.generation.name.replace("generation-", "").toUpperCase();
  } catch (error) {
    return null;
  }
}

/**
 * Get Pokemon habitat
 */
export async function getPokemonHabitat(
  pokemonId: number,
  pokemonName?: string,
  pokemon?: Pokemon
): Promise<string | null> {
  try {
    // Try to get species from Pokemon object first (most reliable)
    let species: Species | null = null;
    if (pokemon) {
      species = await fetchSpeciesDataFromPokemon(pokemon);
    }
    
    // Fallback: try by name (remove form suffixes)
    if (!species && pokemonName) {
      const baseName = pokemonName.split('-')[0];
      species = await fetchSpeciesDataByName(baseName);
    }
    
    // Final fallback: try by ID
    if (!species) {
      species = await fetchSpeciesData(pokemonId);
    }
    
    if (!species?.habitat) return null;
    
    return species.habitat.name;
  } catch (error) {
    return null;
  }
}

/**
 * Get all habitats
 */
export async function getAllHabitats(): Promise<string[]> {
  try {
    const allPokemon = await getAllPokemonList();
    const habitats = new Set<string>();
    
    // Sample a subset to get habitats (checking all would be too slow)
    const sampleSize = Math.min(100, allPokemon.results.length);
    const sample = allPokemon.results.slice(0, sampleSize);
    
    for (const pokemonItem of sample) {
      const match = pokemonItem.url.match(/\/pokemon\/(\d+)\//);
      if (!match) continue;
      
      try {
        const pokemonId = parseInt(match[1], 10);
        const pokemon = await getPokemonById(pokemonId);
        const habitat = await getPokemonHabitat(pokemonId, pokemonItem.name, pokemon);
        if (habitat) {
          habitats.add(habitat);
        }
      } catch (error) {
        // Skip if Pokemon fetch fails
        continue;
      }
    }
    
    return Array.from(habitats);
  } catch (error) {
    console.error("Error getting all habitats:", error);
    return [];
  }
}

/**
 * Get Pokemon legendary/mythical status
 */
export async function getPokemonLegendaryStatus(
  pokemonId: number,
  pokemonName?: string,
  pokemon?: Pokemon
): Promise<{ isLegendary: boolean; isMythical: boolean } | null> {
  try {
    // Try to get species from Pokemon object first (most reliable)
    let species: Species | null = null;
    if (pokemon) {
      species = await fetchSpeciesDataFromPokemon(pokemon);
    }
    
    // Fallback: try by name (remove form suffixes)
    if (!species && pokemonName) {
      const baseName = pokemonName.split('-')[0];
      species = await fetchSpeciesDataByName(baseName);
    }
    
    // Final fallback: try by ID
    if (!species) {
      species = await fetchSpeciesData(pokemonId);
    }
    
    if (!species) return null;
    
    return {
      isLegendary: species.is_legendary,
      isMythical: species.is_mythical,
    };
  } catch (error) {
    // Silently return null for any errors
    return null;
  }
}

/**
 * Get Pokemon capture rate
 */
export async function getPokemonCaptureRate(
  pokemonId: number,
  pokemonName?: string,
  pokemon?: Pokemon
): Promise<number | null> {
  try {
    // Try to get species from Pokemon object first (most reliable)
    let species: Species | null = null;
    if (pokemon) {
      species = await fetchSpeciesDataFromPokemon(pokemon);
    }
    
    // Fallback: try by name (remove form suffixes)
    if (!species && pokemonName) {
      const baseName = pokemonName.split('-')[0];
      species = await fetchSpeciesDataByName(baseName);
    }
    
    // Final fallback: try by ID
    if (!species) {
      species = await fetchSpeciesData(pokemonId);
    }
    
    if (!species) return null;
    
    return species.capture_rate;
  } catch (error) {
    return null;
  }
}

/**
 * Get random Pokemon for stats/height/weight quizzes
 */
export async function getRandomPokemon(): Promise<Pokemon | null> {
  try {
    const allPokemon = await getAllPokemonList();
    if (allPokemon.results.length === 0) return null;
    
    const randomPokemon = allPokemon.results[Math.floor(Math.random() * allPokemon.results.length)];
    const match = randomPokemon.url.match(/\/pokemon\/(\d+)\//);
    if (!match) return null;
    
    const pokemonId = parseInt(match[1], 10);
    return await getPokemonById(pokemonId);
  } catch (error) {
    console.error("Error getting random Pokemon:", error);
    return null;
  }
}

/**
 * Get multiple random Pokemon for comparison quizzes
 */
export async function getRandomPokemonBatch(count: number): Promise<Pokemon[]> {
  try {
    const allPokemon = await getAllPokemonList();
    if (allPokemon.results.length === 0) return [];
    
    const pokemonList: Pokemon[] = [];
    const usedIds = new Set<number>();
    
    while (pokemonList.length < count && usedIds.size < allPokemon.results.length) {
      const randomIndex = Math.floor(Math.random() * allPokemon.results.length);
      const randomPokemon = allPokemon.results[randomIndex];
      const match = randomPokemon.url.match(/\/pokemon\/(\d+)\//);
      
      if (!match) continue;
      
      const pokemonId = parseInt(match[1], 10);
      if (usedIds.has(pokemonId)) continue;
      
      usedIds.add(pokemonId);
      
      try {
        const pokemon = await getPokemonById(pokemonId);
        pokemonList.push(pokemon);
      } catch (error) {
        // Skip if Pokemon fetch fails
        continue;
      }
    }
    
    return pokemonList;
  } catch (error) {
    console.error("Error getting random Pokemon batch:", error);
    return [];
  }
}

/**
 * Get Pokemon evolution chain data
 */
export async function getPokemonEvolutionChain(pokemonId: number) {
  try {
    const pokemon = await getPokemonById(pokemonId);
    // We need to get species URL first, then evolution chain
    // This is a simplified version - you might need to fetch species separately
    const species = await fetchSpeciesData(pokemonId);
    if (!species?.evolution_chain) return null;
    
    // Fetch evolution chain using the URL from species
    const response = await fetch(species.evolution_chain.url);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting evolution chain:", error);
    return null;
  }
}

/**
 * Get next evolution for a Pokemon
 */
export async function getPokemonNextEvolution(pokemonId: number): Promise<string[] | null> {
  try {
    const species = await fetchSpeciesData(pokemonId);
    if (!species?.evolution_chain) return null;
    
    const evolutionChain = await getEvolutionChainFromSpecies(
      `${POKEAPI_BASE_URL}/pokemon-species/${pokemonId}`
    );
    
    if (!evolutionChain) return null;
    
    // Find the Pokemon in the chain and return its evolutions
    const findEvolutions = (chain: any, targetName: string, found: boolean = false): string[] => {
      if (found && chain.species.name !== targetName) {
        return [chain.species.name];
      }
      
      if (chain.species.name === targetName) {
        return chain.evolves_to.map((evo: any) => evo.species.name);
      }
      
      for (const evo of chain.evolves_to) {
        const result = findEvolutions(evo, targetName, found);
        if (result.length > 0) return result;
      }
      
      return [];
    };
    
    const pokemon = await getPokemonById(pokemonId);
    return findEvolutions(evolutionChain.chain, pokemon.name);
  } catch (error) {
    console.error("Error getting next evolution:", error);
    return null;
  }
}

/**
 * Get random moves for move power quiz
 */
export async function getRandomMoves(count: number): Promise<Move[]> {
  try {
    const moves = await getMoveList(0, 900);
    if (moves.results.length === 0) return [];
    
    const selectedMoves: Move[] = [];
    const usedNames = new Set<string>();
    
    while (selectedMoves.length < count && usedNames.size < moves.results.length) {
      const randomMove = moves.results[Math.floor(Math.random() * moves.results.length)];
      
      if (usedNames.has(randomMove.name)) continue;
      usedNames.add(randomMove.name);
      
      try {
        const move = await getMoveById(randomMove.name);
        if (move.power !== null) {
          // Only include moves with power (exclude status moves)
          selectedMoves.push(move);
        }
      } catch (error) {
        continue;
      }
    }
    
    return selectedMoves;
  } catch (error) {
    console.error("Error getting random moves:", error);
    return [];
  }
}

