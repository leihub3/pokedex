import type { Pokemon } from "@/types/api";
import { calculateEffectiveness, type Effectiveness } from "./typeEffectiveness";

/**
 * Calculate damage dealt by an attack
 * Simplified damage formula based on base stats and type effectiveness
 */
export function calculateDamage(
  attacker: Pokemon,
  defender: Pokemon,
  movePower: number,
  moveType: string,
  isPhysical: boolean = true
): number {
  // Get relevant attack/defense stat
  const attackStat = isPhysical
    ? attacker.stats.find((s) => s.stat.name === "attack")?.base_stat ?? 0
    : attacker.stats.find((s) => s.stat.name === "special-attack")?.base_stat ?? 0;

  const defenseStat = isPhysical
    ? defender.stats.find((s) => s.stat.name === "defense")?.base_stat ?? 0
    : defender.stats.find((s) => s.stat.name === "special-defense")?.base_stat ?? 0;

  // Calculate type effectiveness
  const defendingTypes = defender.types.map((t) => t.type.name);
  const effectiveness = calculateEffectiveness(moveType, defendingTypes);

  // Simplified damage formula (not exact game formula, but good approximation)
  const baseDamage = ((2 * 50) / 5 + 2) * movePower * (attackStat / defenseStat);
  const damage = Math.floor((baseDamage / 50 + 2) * effectiveness);

  return Math.max(1, damage);
}

/**
 * Calculate theoretical battle outcome
 * Returns win probability and average damage dealt
 */
export function calculateBattleOutcome(
  pokemon1: Pokemon,
  pokemon2: Pokemon,
  move1Power: number = 80,
  move1Type: string = pokemon1.types[0]?.type.name ?? "normal",
  move2Power: number = 80,
  move2Type: string = pokemon2.types[0]?.type.name ?? "normal"
): {
  pokemon1WinProbability: number;
  pokemon2WinProbability: number;
  pokemon1AvgDamage: number;
  pokemon2AvgDamage: number;
  turnsToWin1: number;
  turnsToWin2: number;
} {
  const hp1 = pokemon1.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 100;
  const hp2 = pokemon2.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 100;

  // Calculate damage per turn
  const damage1to2 = calculateDamage(pokemon1, pokemon2, move1Power, move1Type);
  const damage2to1 = calculateDamage(pokemon2, pokemon1, move2Power, move2Type);

  // Calculate turns to win
  const turnsToWin1 = Math.ceil(hp2 / damage1to2);
  const turnsToWin2 = Math.ceil(hp1 / damage2to1);

  // Calculate win probability (simplified: faster KO wins)
  let pokemon1WinProbability = 0.5;
  if (turnsToWin1 < turnsToWin2) {
    pokemon1WinProbability = 0.7;
  } else if (turnsToWin2 < turnsToWin1) {
    pokemon1WinProbability = 0.3;
  }

  return {
    pokemon1WinProbability,
    pokemon2WinProbability: 1 - pokemon1WinProbability,
    pokemon1AvgDamage: damage1to2,
    pokemon2AvgDamage: damage2to1,
    turnsToWin1,
    turnsToWin2,
  };
}

/**
 * Get total base stats for a Pokémon
 */
export function getTotalBaseStats(pokemon: Pokemon): number {
  return pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
}

/**
 * Compare two Pokémon by stat total
 */
export function compareByStatTotal(a: Pokemon, b: Pokemon): number {
  return getTotalBaseStats(b) - getTotalBaseStats(a);
}

