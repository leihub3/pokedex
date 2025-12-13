"use client";

import { useState, useEffect, useRef } from "react";
import type { BattleEvent, BattleState } from "@/battle-engine";

export type AnimationSpeed = 1 | 2 | 4;

interface UseBattleAnimationReturn {
  isAnimating: boolean;
  currentEventIndex: number;
  speedMultiplier: AnimationSpeed;
  setSpeedMultiplier: (speed: AnimationSpeed) => void;
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
export function useBattleAnimation(speedMultiplier: AnimationSpeed = 1): UseBattleAnimationReturn {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [speed, setSpeed] = useState<AnimationSpeed>(speedMultiplier);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Get animation duration for an event type
   * Applies speed multiplier to reduce duration
   */
  const getEventDuration = (event: BattleEvent): number => {
    let baseDuration: number;
    switch (event.type) {
      case "move_used":
        baseDuration = ANIMATION_TIMINGS.moveUsed;
        break;
      case "damage_dealt":
        baseDuration = ANIMATION_TIMINGS.damage;
        break;
      case "status_applied":
      case "status_damage":
      case "status_healed":
        baseDuration = ANIMATION_TIMINGS.status;
        break;
      case "stat_changed":
        baseDuration = ANIMATION_TIMINGS.statChange;
        break;
      case "faint":
        baseDuration = ANIMATION_TIMINGS.faint;
        break;
      case "turn_start":
        baseDuration = ANIMATION_TIMINGS.turnStart;
        break;
      default:
        baseDuration = ANIMATION_TIMINGS.default;
    }
    
    // Apply speed multiplier (higher multiplier = faster = shorter duration)
    return Math.max(50, baseDuration / speed); // Minimum 50ms for any animation
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
    speedMultiplier: speed,
    setSpeedMultiplier: setSpeed,
    startAnimations,
    reset,
  };
}

