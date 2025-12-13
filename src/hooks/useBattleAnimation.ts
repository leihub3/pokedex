"use client";

import { useState, useEffect, useRef } from "react";
import type { BattleEvent, BattleState } from "@/battle-engine";

interface UseBattleAnimationReturn {
  isAnimating: boolean;
  currentEventIndex: number;
  startAnimations: (events: BattleEvent[]) => Promise<void>;
  reset: () => void;
}

/**
 * Animation timing configuration (in milliseconds)
 */
const ANIMATION_TIMINGS = {
  moveUsed: 300,
  damage: 500,
  status: 400,
  statChange: 300,
  faint: 600,
  turnStart: 200,
  default: 300,
};

/**
 * Hook to manage battle animation queue
 * Plays animations sequentially for battle events
 */
export function useBattleAnimation(): UseBattleAnimationReturn {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Get animation duration for an event type
   */
  const getEventDuration = (event: BattleEvent): number => {
    switch (event.type) {
      case "move_used":
        return ANIMATION_TIMINGS.moveUsed;
      case "damage_dealt":
        return ANIMATION_TIMINGS.damage;
      case "status_applied":
      case "status_damage":
      case "status_healed":
        return ANIMATION_TIMINGS.status;
      case "stat_changed":
        return ANIMATION_TIMINGS.statChange;
      case "faint":
        return ANIMATION_TIMINGS.faint;
      case "turn_start":
        return ANIMATION_TIMINGS.turnStart;
      default:
        return ANIMATION_TIMINGS.default;
    }
  };

  /**
   * Start animating a sequence of events
   */
  const startAnimations = async (events: BattleEvent[]): Promise<void> => {
    if (events.length === 0) return;

    setIsAnimating(true);
    setCurrentEventIndex(0);

    // Play animations sequentially
    for (let i = 0; i < events.length; i++) {
      setCurrentEventIndex(i);
      const event = events[i];
      const duration = getEventDuration(event);

      await new Promise<void>((resolve) => {
        animationTimeoutRef.current = setTimeout(() => {
          resolve();
        }, duration);
      });
    }

    setIsAnimating(false);
    setCurrentEventIndex(0);
  };

  /**
   * Reset animation state
   */
  const reset = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setIsAnimating(false);
    setCurrentEventIndex(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return {
    isAnimating,
    currentEventIndex,
    startAnimations,
    reset,
  };
}

