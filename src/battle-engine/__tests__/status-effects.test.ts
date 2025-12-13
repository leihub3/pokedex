import { describe, it, expect } from "vitest";
import { SeededRNG } from "../rng";
import {
  canAct,
  getSpeedMultiplier,
  applyStatusHPLoss,
  processStatusTurn,
  createStatus,
} from "../effects";
import type { StatusCondition } from "../models/status";

describe("Status Effects", () => {
  describe("burn", () => {
    it("should cause HP loss per turn", () => {
      const maxHP = 100;
      const hpLoss = applyStatusHPLoss({ type: "burn" }, maxHP);
      expect(hpLoss).toBe(Math.floor(maxHP / 16)); // 1/16 of max HP
    });

    it("should have minimum HP loss of 1", () => {
      const maxHP = 10;
      const hpLoss = applyStatusHPLoss({ type: "burn" }, maxHP);
      expect(hpLoss).toBeGreaterThanOrEqual(1);
    });

    it("should not prevent actions", () => {
      const rng = new SeededRNG(12345);
      const canActBurn = canAct({ type: "burn" }, rng);
      expect(canActBurn).toBe(true);
    });
  });

  describe("poison", () => {
    it("should cause HP loss per turn", () => {
      const maxHP = 100;
      const hpLoss = applyStatusHPLoss({ type: "poison" }, maxHP);
      expect(hpLoss).toBe(Math.floor(maxHP / 16)); // 1/16 of max HP
    });

    it("should have minimum HP loss of 1", () => {
      const maxHP = 10;
      const hpLoss = applyStatusHPLoss({ type: "poison" }, maxHP);
      expect(hpLoss).toBeGreaterThanOrEqual(1);
    });

    it("should not prevent actions", () => {
      const rng = new SeededRNG(12345);
      const canActPoison = canAct({ type: "poison" }, rng);
      expect(canActPoison).toBe(true);
    });
  });

  describe("paralysis", () => {
    it("should reduce speed", () => {
      const speedMultiplier = getSpeedMultiplier({ type: "paralysis" });
      expect(speedMultiplier).toBe(0.25);
    });

    it("should have a chance to prevent actions", () => {
      const seed = 12345;
      const rng1 = new SeededRNG(seed);
      const rng2 = new SeededRNG(seed);

      // Same seed should produce same result
      const canAct1 = canAct({ type: "paralysis" }, rng1);
      const canAct2 = canAct({ type: "paralysis" }, rng2);
      expect(canAct1).toBe(canAct2);

      // Should have roughly 75% chance to act (25% chance to be paralyzed)
      // Test determinism first
      const deterministicResults: boolean[] = [];
      for (let i = 0; i < 10; i++) {
        const rng = new SeededRNG(1000 + i);
        deterministicResults.push(canAct({ type: "paralysis" }, rng));
      }

      // Same seeds should produce same results
      for (let i = 0; i < 10; i++) {
        const rng = new SeededRNG(1000 + i);
        expect(canAct({ type: "paralysis" }, rng)).toBe(deterministicResults[i]);
      }

      // Test distribution with larger sample
      const results: boolean[] = [];
      for (let i = 0; i < 10000; i++) {
        const rng = new SeededRNG(i);
        results.push(canAct({ type: "paralysis" }, rng));
      }
      const actCount = results.filter((r) => r).length;
      const actRate = actCount / 10000;
      // Allow variance around 75% (expect roughly 70-80% due to RNG distribution)
      expect(actRate).toBeGreaterThan(0.70); // At least 70% act rate
      expect(actRate).toBeLessThan(0.80); // At most 80% act rate
    });
  });

  describe("sleep", () => {
    it("should prevent actions while sleeping", () => {
      const rng = new SeededRNG(12345);
      const status: StatusCondition = { type: "sleep", turnsRemaining: 2 };
      const canActSleep = canAct(status, rng);
      expect(canActSleep).toBe(false);
    });

    it("should allow actions when sleep counter is 0", () => {
      const rng = new SeededRNG(12345);
      const status: StatusCondition = { type: "sleep", turnsRemaining: 0 };
      const canActSleep = canAct(status, rng);
      expect(canActSleep).toBe(true);
    });

    it("should decrement sleep counter each turn", () => {
      const status1: StatusCondition = { type: "sleep", turnsRemaining: 3 };
      const status2 = processStatusTurn(status1);
      expect(status2).not.toBeNull();
      if (status2 && status2.type === "sleep") {
        expect(status2.turnsRemaining).toBe(2);
      }

      const status3 = processStatusTurn(status2!);
      expect(status3).not.toBeNull();
      if (status3 && status3.type === "sleep") {
        expect(status3.turnsRemaining).toBe(1);
      }

      const status4 = processStatusTurn(status3!);
      // Should wake up (return null)
      expect(status4).toBeNull();
    });

    it("should generate sleep duration between 1-3 turns", () => {
      const durations: number[] = [];
      for (let i = 0; i < 100; i++) {
        const rng = new SeededRNG(i);
        const status = createStatus("sleep", rng);
        if (status.type === "sleep") {
          durations.push(status.turnsRemaining);
        }
      }

      // All durations should be between 1 and 3
      for (const duration of durations) {
        expect(duration).toBeGreaterThanOrEqual(1);
        expect(duration).toBeLessThanOrEqual(3);
      }
    });

    it("should not cause HP loss", () => {
      const maxHP = 100;
      const status: StatusCondition = { type: "sleep", turnsRemaining: 2 };
      const hpLoss = applyStatusHPLoss(status, maxHP);
      expect(hpLoss).toBe(0);
    });
  });

  describe("status persistence", () => {
    it("should persist burn across turns", () => {
      const status = processStatusTurn({ type: "burn" });
      expect(status).toEqual({ type: "burn" });
    });

    it("should persist poison across turns", () => {
      const status = processStatusTurn({ type: "poison" });
      expect(status).toEqual({ type: "poison" });
    });

    it("should persist paralysis across turns", () => {
      const status = processStatusTurn({ type: "paralysis" });
      expect(status).toEqual({ type: "paralysis" });
    });
  });

  describe("no status", () => {
    it("should allow actions when no status", () => {
      const rng = new SeededRNG(12345);
      expect(canAct(null, rng)).toBe(true);
    });

    it("should have no speed modifier when no status", () => {
      expect(getSpeedMultiplier(null)).toBe(1.0);
    });

    it("should cause no HP loss when no status", () => {
      const maxHP = 100;
      expect(applyStatusHPLoss(null, maxHP)).toBe(0);
    });
  });
});

