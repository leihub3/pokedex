import { describe, it, expect } from "vitest";
import { SeededRNG } from "../rng";

describe("SeededRNG", () => {
  describe("determinism", () => {
    it("should produce the same sequence with the same seed", () => {
      const seed = 12345;
      const rng1 = new SeededRNG(seed);
      const rng2 = new SeededRNG(seed);

      const sequence1 = Array.from({ length: 100 }, () => rng1.next());
      const sequence2 = Array.from({ length: 100 }, () => rng2.next());

      expect(sequence1).toEqual(sequence2);
    });

    it("should produce different sequences with different seeds", () => {
      const rng1 = new SeededRNG(12345);
      const rng2 = new SeededRNG(67890);

      const value1 = rng1.next();
      const value2 = rng2.next();

      expect(value1).not.toBe(value2);
    });
  });

  describe("next()", () => {
    it("should return values between 0 and 1", () => {
      const rng = new SeededRNG(12345);
      
      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it("should produce different values on consecutive calls", () => {
      const rng = new SeededRNG(12345);
      const value1 = rng.next();
      const value2 = rng.next();
      
      expect(value1).not.toBe(value2);
    });
  });

  describe("nextInt()", () => {
    it("should return integers in the correct range", () => {
      const rng = new SeededRNG(12345);
      const max = 10;

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(max);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(max);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it("should throw error for invalid max", () => {
      const rng = new SeededRNG(12345);
      expect(() => rng.nextInt(0)).toThrow();
      expect(() => rng.nextInt(-1)).toThrow();
    });

    it("should be deterministic", () => {
      const seed = 12345;
      const rng1 = new SeededRNG(seed);
      const rng2 = new SeededRNG(seed);

      for (let i = 0; i < 50; i++) {
        expect(rng1.nextInt(100)).toBe(rng2.nextInt(100));
      }
    });
  });

  describe("nextFloat()", () => {
    it("should return values in the correct range", () => {
      const rng = new SeededRNG(12345);
      const min = 5;
      const max = 10;

      for (let i = 0; i < 100; i++) {
        const value = rng.nextFloat(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThan(max);
      }
    });

    it("should be deterministic", () => {
      const seed = 12345;
      const rng1 = new SeededRNG(seed);
      const rng2 = new SeededRNG(seed);

      for (let i = 0; i < 50; i++) {
        expect(rng1.nextFloat(0, 100)).toBe(rng2.nextFloat(0, 100));
      }
    });
  });

  describe("chance()", () => {
    it("should return boolean values", () => {
      const rng = new SeededRNG(12345);
      
      for (let i = 0; i < 100; i++) {
        const result = rng.chance(0.5);
        expect(typeof result).toBe("boolean");
      }
    });

    it("should always return true for probability 1", () => {
      const rng = new SeededRNG(12345);
      
      for (let i = 0; i < 100; i++) {
        expect(rng.chance(1)).toBe(true);
      }
    });

    it("should always return false for probability 0", () => {
      const rng = new SeededRNG(12345);
      
      for (let i = 0; i < 100; i++) {
        expect(rng.chance(0)).toBe(false);
      }
    });

    it("should throw error for invalid probability", () => {
      const rng = new SeededRNG(12345);
      expect(() => rng.chance(-0.1)).toThrow();
      expect(() => rng.chance(1.1)).toThrow();
    });

    it("should be deterministic", () => {
      const seed = 12345;
      const rng1 = new SeededRNG(seed);
      const rng2 = new SeededRNG(seed);

      for (let i = 0; i < 100; i++) {
        expect(rng1.chance(0.25)).toBe(rng2.chance(0.25));
      }
    });
  });

  describe("getSeed()", () => {
    it("should return the seed value", () => {
      const seed = 12345;
      const rng = new SeededRNG(seed);
      expect(rng.getSeed()).toBe(seed);
    });
  });

  describe("fromSeed()", () => {
    it("should create RNG with specified seed", () => {
      const seed = 12345;
      const rng = SeededRNG.fromSeed(seed);
      expect(rng.getSeed()).toBe(seed);
    });

    it("should produce same sequence as constructor", () => {
      const seed = 12345;
      const rng1 = new SeededRNG(seed);
      const rng2 = SeededRNG.fromSeed(seed);

      for (let i = 0; i < 50; i++) {
        expect(rng1.next()).toBe(rng2.next());
      }
    });
  });

  describe("distribution", () => {
    it("should have reasonable distribution for nextInt", () => {
      const rng = new SeededRNG(12345);
      const max = 10;
      const iterations = 10000;
      const counts = new Array(max).fill(0);

      for (let i = 0; i < iterations; i++) {
        const value = rng.nextInt(max);
        counts[value]++;
      }

      // Each value should appear roughly 1000 times (10% of 10000)
      // Allow 10% variance
      const expected = iterations / max;
      const variance = expected * 0.1;

      for (const count of counts) {
        expect(count).toBeGreaterThan(expected - variance);
        expect(count).toBeLessThan(expected + variance);
      }
    });

    it("should have reasonable distribution for chance", () => {
      const rng = new SeededRNG(12345);
      const probability = 0.3;
      const iterations = 10000;
      let trueCount = 0;

      for (let i = 0; i < iterations; i++) {
        if (rng.chance(probability)) {
          trueCount++;
        }
      }

      const actualProbability = trueCount / iterations;
      const expected = probability;
      const variance = 0.05; // 5% variance

      expect(actualProbability).toBeGreaterThan(expected - variance);
      expect(actualProbability).toBeLessThan(expected + variance);
    });
  });
});



