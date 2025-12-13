/**
 * Seeded Random Number Generator
 * 
 * Uses a multiplicative Linear Congruential Generator (LCG) for deterministic randomness.
 * Same seed will always produce the same sequence of random numbers.
 */

export class SeededRNG {
  private seed: number;

  /**
   * Creates a new seeded RNG instance
   * @param seed - Initial seed value. If not provided, uses current timestamp.
   */
  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
  }

  /**
   * Get the current seed value (useful for replaying battles)
   */
  getSeed(): number {
    return this.seed;
  }

  /**
   * Generate next random number using LCG algorithm
   * LCG formula: (a * seed + c) mod m
   * Using constants from Numerical Recipes (Knuth's parameters)
   */
  private nextRaw(): number {
    // Using constants for a good LCG (from Numerical Recipes)
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    
    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }

  /**
   * Generate next random float between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    return this.nextRaw();
  }

  /**
   * Generate next random integer between 0 (inclusive) and max (exclusive)
   * @param max - Maximum value (exclusive)
   */
  nextInt(max: number): number {
    if (max <= 0) {
      throw new Error("max must be greater than 0");
    }
    return Math.floor(this.nextRaw() * max);
  }

  /**
   * Generate next random float between min (inclusive) and max (exclusive)
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   */
  nextFloat(min: number, max: number): number {
    return min + (max - min) * this.nextRaw();
  }

  /**
   * Check if a random chance occurs (returns true with given probability)
   * @param probability - Probability between 0 and 1 (e.g., 0.25 for 25% chance)
   */
  chance(probability: number): boolean {
    if (probability < 0 || probability > 1) {
      throw new Error("probability must be between 0 and 1");
    }
    return this.nextRaw() < probability;
  }

  /**
   * Create a new RNG instance with a specific seed
   * Useful for replaying battles with the same randomness
   */
  static fromSeed(seed: number): SeededRNG {
    return new SeededRNG(seed);
  }
}

