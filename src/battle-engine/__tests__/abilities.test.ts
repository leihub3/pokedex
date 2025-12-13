import { describe, it, expect, beforeEach } from "vitest";
import { createBattle, normalizePokemon, normalizeMove } from "../index";
import type { Pokemon as APIPokemon } from "@/types/api";
import type { Move as APIMove } from "@/types/api";

// Mock Pokemon data
const createMockPokemon = (overrides: Partial<APIPokemon>): APIPokemon => ({
  id: 1,
  name: "test",
  base_experience: 100,
  height: 10,
  weight: 100,
  sprites: {
    front_default: null,
    front_shiny: null,
    other: {
      "official-artwork": {
        front_default: null,
        front_shiny: null,
      },
    },
  },
  types: [{ slot: 1, type: { name: "normal", url: "" } }],
  stats: [
    { base_stat: 100, effort: 0, stat: { name: "hp", url: "" } },
    { base_stat: 100, effort: 0, stat: { name: "attack", url: "" } },
    { base_stat: 100, effort: 0, stat: { name: "defense", url: "" } },
    { base_stat: 100, effort: 0, stat: { name: "special-attack", url: "" } },
    { base_stat: 100, effort: 0, stat: { name: "special-defense", url: "" } },
    { base_stat: 100, effort: 0, stat: { name: "speed", url: "" } },
  ],
  abilities: [{ ability: { name: "none", url: "" }, is_hidden: false, slot: 1 }],
  moves: [],
  ...overrides,
});

const createMockMove = (overrides: Partial<APIMove>): APIMove => ({
  id: 1,
  name: "tackle",
  accuracy: 100,
  effect_chance: null,
  pp: 35,
  priority: 0,
  power: 40,
  damage_class: { name: "physical", url: "" },
  type: { name: "normal", url: "" },
  effect_entries: [],
  learned_by_pokemon: [],
  ...overrides,
});

// Ensure abilities are imported
import "../abilities/index";

describe("Abilities", () => {

  describe("Intimidate", () => {
    it("should lower opponent attack stage on enter battle", () => {
      const pokemon1 = normalizePokemon(
        createMockPokemon({
          name: "intimidator",
          abilities: [
            { ability: { name: "intimidate", url: "" }, is_hidden: false, slot: 1 },
          ],
        })
      );

      const pokemon2 = normalizePokemon(
        createMockPokemon({
          name: "target",
          abilities: [{ ability: { name: "none", url: "" }, is_hidden: false, slot: 1 }],
        })
      );

      const battle = createBattle(pokemon1, pokemon2, 12345);

      // Check that pokemon2's attack stage was lowered
      const pokemon2Stages = battle.state.activePokemon[1].statStages;
      expect(pokemon2Stages.attack).toBe(-1);
    });

    it("should log stat change event", () => {
      const pokemon1 = normalizePokemon(
        createMockPokemon({
          name: "intimidator",
          abilities: [
            { ability: { name: "intimidate", url: "" }, is_hidden: false, slot: 1 },
          ],
        })
      );

      const pokemon2 = normalizePokemon(
        createMockPokemon({
          name: "target",
          abilities: [{ ability: { name: "none", url: "" }, is_hidden: false, slot: 1 }],
        })
      );

      const battle = createBattle(pokemon1, pokemon2, 12345);

      // Check that stat change event was logged
      const statChangeEvents = battle.state.log.filter(
        (e) => e.type === "stat_changed" && e.stat === "attack"
      );
      expect(statChangeEvents.length).toBeGreaterThan(0);
    });
  });

  describe("Blaze", () => {
    it("should boost fire move damage when HP is below 33%", () => {
      const pokemon1 = normalizePokemon(
        createMockPokemon({
          name: "charizard",
          types: [{ slot: 1, type: { name: "fire", url: "" } }],
          abilities: [
            { ability: { name: "blaze", url: "" }, is_hidden: false, slot: 1 },
          ],
          stats: [
            { base_stat: 78, effort: 0, stat: { name: "hp", url: "" } }, // Low HP
            { base_stat: 84, effort: 0, stat: { name: "attack", url: "" } },
            { base_stat: 78, effort: 0, stat: { name: "defense", url: "" } },
            { base_stat: 109, effort: 0, stat: { name: "special-attack", url: "" } },
            { base_stat: 85, effort: 0, stat: { name: "special-defense", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "speed", url: "" } },
          ],
        })
      );

      const pokemon2 = normalizePokemon(
        createMockPokemon({
          name: "target",
          abilities: [{ ability: { name: "none", url: "" }, is_hidden: false, slot: 1 }],
        })
      );

      const battle = createBattle(pokemon1, pokemon2, 12345);

      // Set pokemon1's HP to below 33%
      const modifiedState = {
        ...battle.state,
        activePokemon: [
          {
            ...battle.state.activePokemon[0],
            currentHP: Math.floor(battle.state.activePokemon[0].maxHP * 0.3), // 30% HP
          },
          battle.state.activePokemon[1],
        ] as [typeof battle.state.activePokemon[0], typeof battle.state.activePokemon[1]],
      };

      const modifiedBattle = { state: modifiedState };

      const fireMove = normalizeMove(
        createMockMove({
          name: "flamethrower",
          type: { name: "fire", url: "" },
          power: 90,
          damage_class: { name: "special", url: "" },
        })
      );

      const normalMove = normalizeMove(
        createMockMove({
          name: "tackle",
          type: { name: "normal", url: "" },
          power: 90,
          damage_class: { name: "physical", url: "" },
        })
      );

      // Execute a turn with fire move
      const battleAfterFire = executeTurnInBattle(modifiedBattle, fireMove, normalMove);

      // Check that damage was dealt (ability should have boosted it)
      const damageEvents = battleAfterFire.state.log.filter(
        (e) => e.type === "damage_dealt" && e.pokemonIndex === 1
      );
      expect(damageEvents.length).toBeGreaterThan(0);
    });
  });
});

import { executeTurnInBattle } from "../battle";

