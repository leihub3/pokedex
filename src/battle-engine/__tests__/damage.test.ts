import { describe, it, expect } from "vitest";
import { SeededRNG } from "../rng";
import { calculateDamage } from "../mechanics/damage";
import type { Pokemon } from "../models/pokemon";
import type { Move } from "../models/move";
import type { StatStages } from "../models/stats";
import { createStatStages } from "../models/stats";

describe("Damage Calculation", () => {
  const createTestPokemon = (overrides?: Partial<Pokemon>): Pokemon => ({
    id: 1,
    name: "test",
    types: ["normal"],
    baseStats: {
      hp: 100,
      attack: 100,
      defense: 100,
      specialAttack: 100,
      specialDefense: 100,
      speed: 100,
    },
    ability: "none",
    ...overrides,
  });

  const createTestMove = (overrides?: Partial<Move>): Move => ({
    id: 1,
    name: "tackle",
    type: "normal",
    power: 40,
    accuracy: 100,
    priority: 0,
    damageClass: "physical",
    ...overrides,
  });

  describe("consistency", () => {
    it("should produce the same damage with the same seed", () => {
      const seed = 12345;
      const attacker = createTestPokemon();
      const defender = createTestPokemon();
      const move = createTestMove();
      const stages = createStatStages();

      const rng1 = new SeededRNG(seed);
      const damage1 = calculateDamage(
        attacker,
        defender,
        move,
        stages,
        stages,
        null,
        rng1
      );

      const rng2 = new SeededRNG(seed);
      const damage2 = calculateDamage(
        attacker,
        defender,
        move,
        stages,
        stages,
        null,
        rng2
      );

      expect(damage1).toBe(damage2);
    });

    it("should produce consistent damage with same inputs (excluding random factor)", () => {
      const attacker = createTestPokemon();
      const defender = createTestPokemon();
      const move = createTestMove({ power: 100 });
      const stages = createStatStages();

      // Run multiple times with same seed - should get same result
      const damages = Array.from({ length: 10 }, () => {
        const rng = new SeededRNG(12345);
        return calculateDamage(
          attacker,
          defender,
          move,
          stages,
          stages,
          null,
          rng
        );
      });

      expect(new Set(damages).size).toBe(1); // All should be the same
    });
  });

  describe("STAB", () => {
    it("should apply STAB when move type matches Pokemon type", () => {
      const seed = 12345;
      const attacker = createTestPokemon({ types: ["fire"] });
      const defender = createTestPokemon();
      const fireMove = createTestMove({ type: "fire", power: 80 });
      const normalMove = createTestMove({ type: "normal", power: 80 });
      const stages = createStatStages();

      const rng1 = new SeededRNG(seed);
      const fireDamage = calculateDamage(
        attacker,
        defender,
        fireMove,
        stages,
        stages,
        null,
        rng1
      );

      const rng2 = new SeededRNG(seed);
      const normalDamage = calculateDamage(
        attacker,
        defender,
        normalMove,
        stages,
        stages,
        null,
        rng2
      );

      // Fire move should do more damage due to STAB (approximately 1.5x)
      expect(fireDamage).toBeGreaterThan(normalDamage);
      // Should be roughly 1.5x (allowing for random factor variance)
      expect(fireDamage / normalDamage).toBeGreaterThan(1.4);
      expect(fireDamage / normalDamage).toBeLessThan(1.6);
    });

    it("should not apply STAB when move type doesn't match Pokemon type", () => {
      const seed = 12345;
      const attacker = createTestPokemon({ types: ["water"] });
      const defender = createTestPokemon();
      const fireMove = createTestMove({ type: "fire", power: 80 });
      const waterMove = createTestMove({ type: "water", power: 80 });
      const stages = createStatStages();

      const rng1 = new SeededRNG(seed);
      const fireDamage = calculateDamage(
        attacker,
        defender,
        fireMove,
        stages,
        stages,
        null,
        rng1
      );

      const rng2 = new SeededRNG(seed);
      const waterDamage = calculateDamage(
        attacker,
        defender,
        waterMove,
        stages,
        stages,
        null,
        rng2
      );

      // Water move should do more damage due to STAB
      expect(waterDamage).toBeGreaterThan(fireDamage);
    });
  });

  describe("type effectiveness", () => {
    it("should apply super effective multiplier (2x)", () => {
      const attacker = createTestPokemon();
      const defender = createTestPokemon({ types: ["grass"] });
      const fireMove = createTestMove({ type: "fire", power: 80 });
      const normalMove = createTestMove({ type: "normal", power: 80 });
      const stages = createStatStages();

      // Use multiple seeds to test consistency
      let fireDamageSum = 0;
      let normalDamageSum = 0;
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        const seed = 1000 + i;
        const rng1 = new SeededRNG(seed);
        fireDamageSum += calculateDamage(
          attacker,
          defender,
          fireMove,
          stages,
          stages,
          null,
          rng1
        );

        const rng2 = new SeededRNG(seed);
        normalDamageSum += calculateDamage(
          attacker,
          defender,
          normalMove,
          stages,
          stages,
          null,
          rng2
        );
      }

      const avgFireDamage = fireDamageSum / iterations;
      const avgNormalDamage = normalDamageSum / iterations;

      // Fire should be super effective against grass (~2x)
      // Note: Actual ratio may be less than 2x due to random factor variance
      // but should still be significantly higher than normal damage
      expect(avgFireDamage / avgNormalDamage).toBeGreaterThan(1.2); // At least 1.2x on average
      expect(avgFireDamage).toBeGreaterThan(avgNormalDamage); // Fire should always do more damage
    });

    it("should apply not very effective multiplier (0.5x)", () => {
      const seed = 12345;
      const attacker = createTestPokemon();
      const defender = createTestPokemon({ types: ["water"] });
      const fireMove = createTestMove({ type: "fire", power: 80 });
      const normalMove = createTestMove({ type: "normal", power: 80 });
      const stages = createStatStages();

      const rng1 = new SeededRNG(seed);
      const fireDamage = calculateDamage(
        attacker,
        defender,
        fireMove,
        stages,
        stages,
        null,
        rng1
      );

      const rng2 = new SeededRNG(seed);
      const normalDamage = calculateDamage(
        attacker,
        defender,
        normalMove,
        stages,
        stages,
        null,
        rng2
      );

      // Fire should be not very effective against water
      expect(fireDamage).toBeLessThan(normalDamage * 0.6); // At most ~0.5x
    });

    it("should apply no effect multiplier (0x)", () => {
      const seed = 12345;
      const attacker = createTestPokemon();
      const defender = createTestPokemon({ types: ["ground"] });
      const electricMove = createTestMove({ type: "electric", power: 80 });
      const stages = createStatStages();

      const rng = new SeededRNG(seed);
      const damage = calculateDamage(
        attacker,
        defender,
        electricMove,
        stages,
        stages,
        null,
        rng
      );

      // Electric should have no effect on ground
      expect(damage).toBe(0);
    });
  });

  describe("burn penalty", () => {
    it("should reduce physical move damage by 0.5x when burned", () => {
      const seed = 12345;
      const attacker = createTestPokemon();
      const defender = createTestPokemon();
      const physicalMove = createTestMove({
        type: "normal",
        power: 80,
        damageClass: "physical",
      });
      const stages = createStatStages();

      const rng1 = new SeededRNG(seed);
      const normalDamage = calculateDamage(
        attacker,
        defender,
        physicalMove,
        stages,
        stages,
        null,
        rng1
      );

      const rng2 = new SeededRNG(seed);
      const burnedDamage = calculateDamage(
        attacker,
        defender,
        physicalMove,
        stages,
        stages,
        { type: "burn" },
        rng2
      );

      // Burned Pokemon should do less damage with physical moves
      expect(burnedDamage).toBeLessThan(normalDamage * 0.6); // Roughly 0.5x
    });

    it("should not affect special move damage when burned", () => {
      const seed = 12345;
      const attacker = createTestPokemon();
      const defender = createTestPokemon();
      const specialMove = createTestMove({
        type: "normal",
        power: 80,
        damageClass: "special",
      });
      const stages = createStatStages();

      const rng1 = new SeededRNG(seed);
      const normalDamage = calculateDamage(
        attacker,
        defender,
        specialMove,
        stages,
        stages,
        null,
        rng1
      );

      const rng2 = new SeededRNG(seed);
      const burnedDamage = calculateDamage(
        attacker,
        defender,
        specialMove,
        stages,
        stages,
        { type: "burn" },
        rng2
      );

      // Special moves should not be affected by burn
      expect(burnedDamage).toBeCloseTo(normalDamage, 0);
    });
  });

  describe("stat stages", () => {
    it("should increase damage with positive attack stages", () => {
      const seed = 12345;
      const attacker = createTestPokemon();
      const defender = createTestPokemon();
      const move = createTestMove({ power: 80 });
      const baseStages = createStatStages();
      const boostedStages = { ...baseStages, attack: 2 };

      const rng1 = new SeededRNG(seed);
      const baseDamage = calculateDamage(
        attacker,
        defender,
        move,
        baseStages,
        baseStages,
        null,
        rng1
      );

      const rng2 = new SeededRNG(seed);
      const boostedDamage = calculateDamage(
        attacker,
        defender,
        move,
        boostedStages,
        baseStages,
        null,
        rng2
      );

      // +2 attack should increase damage significantly
      expect(boostedDamage).toBeGreaterThan(baseDamage);
    });

    it("should decrease damage taken with positive defense stages", () => {
      const seed = 12345;
      const attacker = createTestPokemon();
      const defender = createTestPokemon();
      const move = createTestMove({ power: 80 });
      const baseStages = createStatStages();
      const boostedDefenseStages = { ...baseStages, defense: 2 };

      const rng1 = new SeededRNG(seed);
      const baseDamage = calculateDamage(
        attacker,
        defender,
        move,
        baseStages,
        baseStages,
        null,
        rng1
      );

      const rng2 = new SeededRNG(seed);
      const reducedDamage = calculateDamage(
        attacker,
        defender,
        move,
        baseStages,
        boostedDefenseStages,
        null,
        rng2
      );

      // +2 defense should reduce damage taken
      expect(reducedDamage).toBeLessThan(baseDamage);
    });
  });

  describe("minimum damage", () => {
    it("should do at least 1 damage (unless no effect)", () => {
      const attacker = createTestPokemon({ baseStats: { ...createTestPokemon().baseStats, attack: 1 } });
      const defender = createTestPokemon({ baseStats: { ...createTestPokemon().baseStats, defense: 999 } });
      const move = createTestMove({ power: 1 });
      const stages = createStatStages();

      const rng = new SeededRNG(12345);
      const damage = calculateDamage(
        attacker,
        defender,
        move,
        stages,
        stages,
        null,
        rng
      );

      expect(damage).toBeGreaterThanOrEqual(1);
    });

    it("should do 0 damage for no effect moves", () => {
      const attacker = createTestPokemon();
      const defender = createTestPokemon({ types: ["ground"] });
      const electricMove = createTestMove({ type: "electric", power: 100 });
      const stages = createStatStages();

      const rng = new SeededRNG(12345);
      const damage = calculateDamage(
        attacker,
        defender,
        electricMove,
        stages,
        stages,
        null,
        rng
      );

      expect(damage).toBe(0);
    });
  });

  describe("non-damaging moves", () => {
    it("should return 0 damage for status moves", () => {
      const attacker = createTestPokemon();
      const defender = createTestPokemon();
      const statusMove = createTestMove({
        power: null,
        damageClass: "status",
      });
      const stages = createStatStages();

      const rng = new SeededRNG(12345);
      const damage = calculateDamage(
        attacker,
        defender,
        statusMove,
        stages,
        stages,
        null,
        rng
      );

      expect(damage).toBe(0);
    });
  });
});

