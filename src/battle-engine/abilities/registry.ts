import type { Ability } from "./baseAbility";

/**
 * Ability registry
 * Maps ability names to ability implementations
 */
const abilityRegistry = new Map<string, Ability>();

/**
 * Register an ability
 */
export function registerAbility(ability: Ability): void {
  abilityRegistry.set(ability.name.toLowerCase(), ability);
}

/**
 * Get an ability by name
 */
export function getAbility(name: string): Ability | null {
  return abilityRegistry.get(name.toLowerCase()) ?? null;
}

/**
 * Check if an ability is registered
 */
export function hasAbility(name: string): boolean {
  return abilityRegistry.has(name.toLowerCase());
}

/**
 * Get all registered abilities
 */
export function getAllAbilities(): Ability[] {
  return Array.from(abilityRegistry.values());
}



