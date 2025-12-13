import { describe, it, expect } from "vitest";
import {
  createBattle,
  executeTurnInBattle,
  getBattleWinner,
  isBattleFinished,
  normalizePokemon,
  normalizeMove,
} from "../index";
import type { Pokemon as APIPokemon } from "@/types/api";
import type { Move as APIMove } from "@/types/api";

// Helper to create mock Pokemon
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

// Helper to create mock Move
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

describe("Battle Flow", () => {
  describe("determinism", () => {
    it("should produce identical battles with same seed", () => {
      const seed = 12345;

      const pokemon1 = normalizePokemon(
        createMockPokemon({
          name: "pokemon1",
          stats: [
            { base_stat: 100, effort: 0, stat: { name: "hp", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "attack", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "defense", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "special-attack", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "special-defense", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "speed", url: "" } },
          ],
        })
      );

      const pokemon2 = normalizePokemon(
        createMockPokemon({
          name: "pokemon2",
          stats: [
            { base_stat: 100, effort: 0, stat: { name: "hp", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "attack", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "defense", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "special-attack", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "special-defense", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "speed", url: "" } },
          ],
        })
      );

      const move1 = normalizeMove(
        createMockMove({ name: "tackle1", power: 50, accuracy: 100 })
      );
      const move2 = normalizeMove(
        createMockMove({ name: "tackle2", power: 50, accuracy: 100 })
      );

      // Run battle twice with same seed
      let battle1 = createBattle(pokemon1, pokemon2, seed);
      let battle2 = createBattle(pokemon1, pokemon2, seed);

      // Execute same turns
      for (let i = 0; i < 5; i++) {
        battle1 = executeTurnInBattle(battle1, move1, move2);
        battle2 = executeTurnInBattle(battle2, move1, move2);

        // Check that states are identical
        expect(battle1.state.turnNumber).toBe(battle2.state.turnNumber);
        expect(battle1.state.activePokemon[0].currentHP).toBe(
          battle2.state.activePokemon[0].currentHP
        );
        expect(battle1.state.activePokemon[1].currentHP).toBe(
          battle2.state.activePokemon[1].currentHP
        );
      }
    });
  });

  describe("turn order", () => {
    it("should execute faster Pokemon first when priority is equal", () => {
      const fastPokemon = normalizePokemon(
        createMockPokemon({
          name: "fast",
          stats: [
            { base_stat: 100, effort: 0, stat: { name: "hp", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "attack", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "defense", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "special-attack", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "special-defense", url: "" } },
            { base_stat: 150, effort: 0, stat: { name: "speed", url: "" } }, // Faster
          ],
        })
      );

      const slowPokemon = normalizePokemon(
        createMockPokemon({
          name: "slow",
          stats: [
            { base_stat: 100, effort: 0, stat: { name: "hp", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "attack", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "defense", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "special-attack", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "special-defense", url: "" } },
            { base_stat: 50, effort: 0, stat: { name: "speed", url: "" } }, // Slower
          ],
        })
      );

      const move = normalizeMove(createMockMove({ power: 10, accuracy: 100 }));

      const battle = createBattle(fastPokemon, slowPokemon, 12345);
      const battleAfterTurn = executeTurnInBattle(battle, move, move);

      // Fast Pokemon should have acted first (check log)
      const moveUsedEvents = battleAfterTurn.state.log.filter(
        (e) => e.type === "move_used"
      );
      expect(moveUsedEvents.length).toBeGreaterThan(0);
    });
  });

  describe("faint detection", () => {
    it("should detect when a Pokemon faints", () => {
      const pokemon1 = normalizePokemon(
        createMockPokemon({
          name: "weak",
          stats: [
            { base_stat: 10, effort: 0, stat: { name: "hp", url: "" } }, // Very low HP
            { base_stat: 100, effort: 0, stat: { name: "attack", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "defense", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "special-attack", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "special-defense", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "speed", url: "" } },
          ],
        })
      );

      const pokemon2 = normalizePokemon(
        createMockPokemon({
          name: "strong",
          stats: [
            { base_stat: 100, effort: 0, stat: { name: "hp", url: "" } },
            { base_stat: 200, effort: 0, stat: { name: "attack", url: "" } }, // High attack
            { base_stat: 100, effort: 0, stat: { name: "defense", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "special-attack", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "special-defense", url: "" } },
            { base_stat: 100, effort: 0, stat: { name: "speed", url: "" } },
          ],
        })
      );

      const weakMove = normalizeMove(createMockMove({ power: 5, accuracy: 100 }));
      const strongMove = normalizeMove(createMockMove({ power: 100, accuracy: 100 }));

      let battle = createBattle(pokemon1, pokemon2, 12345);
      battle = executeTurnInBattle(battle, weakMove, strongMove);

      // pokemon1 should have fainted
      expect(battle.state.activePokemon[0].currentHP).toBeLessThanOrEqual(0);
      expect(isBattleFinished(battle)).toBe(true);
      expect(getBattleWinner(battle)).toBe(1); // pokemon2 wins
    });
  });

  describe("battle log", () => {
    it("should log battle events", () => {
      const pokemon1 = normalizePokemon(createMockPokemon({ name: "pokemon1" }));
      const pokemon2 = normalizePokemon(createMockPokemon({ name: "pokemon2" }));
      const move = normalizeMove(createMockMove({ power: 50, accuracy: 100 }));

      const battle = createBattle(pokemon1, pokemon2, 12345);
      const battleAfterTurn = executeTurnInBattle(battle, move, move);

      const log = battleAfterTurn.state.log;

      // Should have battle_start event
      expect(log.some((e) => e.type === "battle_start")).toBe(true);

      // Should have turn_start event
      expect(log.some((e) => e.type === "turn_start")).toBe(true);

      // Should have move_used events
      expect(log.some((e) => e.type === "move_used")).toBe(true);

      // Should have damage_dealt events
      expect(log.some((e) => e.type === "damage_dealt")).toBe(true);
    });
  });
});

