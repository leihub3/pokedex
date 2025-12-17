"use client";

import { useRef, useEffect, useCallback } from "react";
import { useAudioStore } from "@/store/audioStore";
import type { BattleEvent } from "@/battle-engine";
import type { Effectiveness } from "@/lib/utils/battleHelpers";

interface BattleAudioContext {
  battleType?: "normal" | "elite-four" | "champion";
  isEliteFour?: boolean;
  isChampion?: boolean;
  effectiveness?: Effectiveness;
}

interface UseBattleAudioReturn {
  preloadSound: (key: string, path: string) => void;
  playSFX: (key: string, volume?: number, playbackRate?: number) => void;
  playMusic: (key: string, fadeIn?: boolean) => Promise<void>;
  stopMusic: (fadeOut?: boolean) => Promise<void>;
  setMusicVolume: (volume: number) => void;
  handleBattleEvent: (event: BattleEvent, context?: BattleAudioContext) => void;
  reset: () => void;
}

// Maximum number of concurrent SFX sounds
const MAX_CONCURRENT_SFX = 4;
// Audio file base path
const SOUNDS_BASE_PATH = "/sounds";

export function useBattleAudio(
  speedMultiplier: number = 1
): UseBattleAudioReturn {
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const activeSFXRef = useRef<Set<HTMLAudioElement>>(new Set());
  const currentMusicRef = useRef<HTMLAudioElement | null>(null);
  const musicFadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { enabled, masterVolume, musicVolume, sfxVolume } = useAudioStore();

  // Check for prefers-reduced-motion
  const prefersReducedMotion = useRef(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      prefersReducedMotion.current = mediaQuery.matches;
      
      const handleChange = (e: MediaQueryListEvent) => {
        prefersReducedMotion.current = e.matches;
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

      // Handle page visibility (pause/resume music)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause music when tab is hidden
        if (currentMusicRef.current && !currentMusicRef.current.paused) {
          currentMusicRef.current.pause();
        }
      } else {
        // Resume music when tab becomes visible (if it was playing)
        if (currentMusicRef.current && enabled) {
          currentMusicRef.current.play().catch((err: any) => {
            // Suppress AbortError (expected when interrupted)
            if (err?.name !== "AbortError") {
              console.error("Failed to resume music:", err);
            }
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [enabled]);

  // Preload a sound file
  const preloadSound = useCallback((key: string, path: string) => {
    if (audioCache.current.has(key)) return;

    try {
      const audio = new Audio(path);
      audio.preload = "auto";
      audioCache.current.set(key, audio);
        } catch (error: any) {
          // Only log non-404 errors (missing files are expected during development)
          if (!error?.message?.includes("404") && !error?.message?.includes("NotSupportedError")) {
            console.error(`Failed to preload sound ${key}:`, error);
          }
        }
  }, []);

  // Play a sound effect
  const playSFX = useCallback(
    (key: string, volume: number = 1, playbackRate: number = 1) => {
      if (!enabled || prefersReducedMotion.current) return;
      if (activeSFXRef.current.size >= MAX_CONCURRENT_SFX) return;

      const cached = audioCache.current.get(key);
      if (!cached) {
        // Try to load on-demand
        try {
          const audio = new Audio(`${SOUNDS_BASE_PATH}/sfx/${key}`);
          audio.preload = "auto";
          audio.volume = masterVolume * sfxVolume * volume;
          audio.playbackRate = playbackRate * speedMultiplier;
          audioCache.current.set(key, audio);
          
          activeSFXRef.current.add(audio);
          audio.play().catch((err) => {
            // Only log non-404 errors (missing files are expected during development)
            if (!err.message?.includes("404") && !err.message?.includes("NotSupportedError")) {
              console.error(`Failed to play SFX ${key}:`, err);
            }
            activeSFXRef.current.delete(audio);
          });
          
          audio.onended = () => {
            activeSFXRef.current.delete(audio);
          };
        } catch (error: any) {
          // Only log non-404 errors (missing files are expected during development)
          if (!error?.message?.includes("404") && !error?.message?.includes("NotSupportedError")) {
            console.error(`Failed to load/play SFX ${key}:`, error);
          }
        }
        return;
      }

      // Clone the audio element for concurrent playback
      try {
        const audio = cached.cloneNode() as HTMLAudioElement;
        audio.volume = masterVolume * sfxVolume * volume;
        audio.playbackRate = playbackRate * speedMultiplier;
        
        activeSFXRef.current.add(audio);
        audio.play().catch((err) => {
          // Only log non-404 errors (missing files are expected during development)
          if (!err.message?.includes("404") && !err.message?.includes("NotSupportedError")) {
            console.error(`Failed to play SFX ${key}:`, err);
          }
          activeSFXRef.current.delete(audio);
        });
        
        audio.onended = () => {
          activeSFXRef.current.delete(audio);
        };
      } catch (error) {
        console.error(`Failed to play SFX ${key}:`, error);
      }
    },
    [enabled, masterVolume, sfxVolume, speedMultiplier]
  );

  // Play background music with optional fade-in
  const playMusic = useCallback(
    async (key: string, fadeIn: boolean = true): Promise<void> => {
      if (!enabled || prefersReducedMotion.current) {
        return;
      }

      // Stop current music first and wait for it to complete
      if (currentMusicRef.current) {
        const previousMusic = currentMusicRef.current;
        await stopMusic(true);
        // Ensure the previous music element is fully stopped
        if (previousMusic) {
          try {
            previousMusic.pause();
            previousMusic.currentTime = 0;
          } catch (err) {
            // Ignore - element may already be cleaned up
          }
        }
        // Small delay to ensure pause has completed and any pending play() promises are resolved
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Clear any existing fade interval
      if (musicFadeIntervalRef.current) {
        clearInterval(musicFadeIntervalRef.current);
        musicFadeIntervalRef.current = null;
      }

      const cached = audioCache.current.get(key);
      if (!cached) {
        // Try to load on-demand
        try {
          const audio = new Audio(`${SOUNDS_BASE_PATH}/music/${key}`);
          
          // Handle loading errors
          audio.addEventListener('error', (e) => {
            console.warn(`Failed to load music ${key}:`, e);
            // Don't set currentMusicRef to null on load error - file might not exist yet
          });
          
          audio.preload = "auto";
          audio.loop = true;
          audio.volume = fadeIn ? 0 : masterVolume * musicVolume;
          audioCache.current.set(key, audio);
          currentMusicRef.current = audio;
        
          try {
            await audio.play();
            console.log(`Music playing: ${key}`);
          } catch (err: any) {
            // Suppress AbortError (interrupted by pause) - this is expected during transitions
            if (err?.name === "AbortError") {
              // Expected during transitions - don't log or clear, music might still work
              console.log(`Music ${key} interrupted (AbortError), continuing...`);
              return;
            }
            // Log other errors for debugging, but don't clear currentMusicRef for missing files
            console.warn(`Failed to play music ${key}:`, err);
            // Only clear on critical errors (not missing files)
            if (err?.name !== "NotSupportedError" && !err?.message?.includes("404")) {
              currentMusicRef.current = null;
            }
          }

          if (fadeIn && currentMusicRef.current) {
            const targetVolume = masterVolume * musicVolume;
            const fadeStep = 0.05;
            const fadeInterval = 50;

            musicFadeIntervalRef.current = setInterval(() => {
              if (currentMusicRef.current) {
                const newVolume = Math.min(
                  targetVolume,
                  currentMusicRef.current.volume + fadeStep
                );
                currentMusicRef.current.volume = newVolume;
                
                if (newVolume >= targetVolume) {
                  if (musicFadeIntervalRef.current) {
                    clearInterval(musicFadeIntervalRef.current);
                    musicFadeIntervalRef.current = null;
                  }
                }
              }
            }, fadeInterval);
          }
        } catch (error: any) {
          // Only log non-404 errors (missing files are expected during development)
          if (!error?.message?.includes("404") && !error?.message?.includes("NotSupportedError")) {
            console.error(`Failed to load/play music ${key}:`, error);
          }
        }
        return;
      }

      try {
        const audio = cached.cloneNode() as HTMLAudioElement;
        audio.loop = true;
        audio.volume = fadeIn ? 0 : masterVolume * musicVolume;
        currentMusicRef.current = audio;
        
        try {
          await audio.play();
          console.log(`Music playing (cached): ${key}`);
        } catch (err: any) {
          // Suppress AbortError (interrupted by pause) - this is expected during transitions
          if (err?.name === "AbortError") {
            // Expected during transitions - don't log or clear, music might still work
            console.log(`Music ${key} interrupted (AbortError), continuing...`);
            return;
          }
          // Log other errors for debugging, but don't clear currentMusicRef for missing files
          console.warn(`Failed to play music ${key}:`, err);
          // Only clear on critical errors (not missing files)
          if (err?.name !== "NotSupportedError" && !err?.message?.includes("404")) {
            currentMusicRef.current = null;
          }
        }

        if (fadeIn && currentMusicRef.current) {
          const targetVolume = masterVolume * musicVolume;
          const fadeStep = 0.05;
          const fadeInterval = 50;

          musicFadeIntervalRef.current = setInterval(() => {
            if (currentMusicRef.current) {
              const newVolume = Math.min(
                targetVolume,
                currentMusicRef.current.volume + fadeStep
              );
              currentMusicRef.current.volume = newVolume;
              
              if (newVolume >= targetVolume) {
                if (musicFadeIntervalRef.current) {
                  clearInterval(musicFadeIntervalRef.current);
                  musicFadeIntervalRef.current = null;
                }
              }
            }
          }, fadeInterval);
        }
      } catch (error: any) {
        // Only log non-404 errors (missing files are expected during development)
        if (!error?.message?.includes("404") && !error?.message?.includes("NotSupportedError")) {
          console.error(`Failed to play music ${key}:`, error);
        }
      }
    },
    [enabled, masterVolume, musicVolume]
  );

  // Stop current music with optional fade-out
  const stopMusic = useCallback(
    async (fadeOut: boolean = false): Promise<void> => {
      if (!currentMusicRef.current) return;

      // Clear any existing fade interval
      if (musicFadeIntervalRef.current) {
        clearInterval(musicFadeIntervalRef.current);
        musicFadeIntervalRef.current = null;
      }

      if (fadeOut) {
        const fadeStep = 0.1;
        const fadeInterval = 50;

        return new Promise((resolve) => {
          musicFadeIntervalRef.current = setInterval(() => {
            if (currentMusicRef.current) {
              const newVolume = Math.max(
                0,
                currentMusicRef.current.volume - fadeStep
              );
              currentMusicRef.current.volume = newVolume;
              
              if (newVolume <= 0) {
                currentMusicRef.current.pause();
                currentMusicRef.current.currentTime = 0;
                currentMusicRef.current = null;
                if (musicFadeIntervalRef.current) {
                  clearInterval(musicFadeIntervalRef.current);
                  musicFadeIntervalRef.current = null;
                }
                resolve();
              }
            } else {
              if (musicFadeIntervalRef.current) {
                clearInterval(musicFadeIntervalRef.current);
                musicFadeIntervalRef.current = null;
              }
              resolve();
            }
          }, fadeInterval);
        });
      } else {
        currentMusicRef.current.pause();
        currentMusicRef.current.currentTime = 0;
        currentMusicRef.current = null;
      }
    },
    []
  );

  // Set music volume dynamically
  const setMusicVolume = useCallback(
    (volume: number) => {
      if (currentMusicRef.current) {
        currentMusicRef.current.volume = masterVolume * musicVolume * volume;
      }
    },
    [masterVolume, musicVolume]
  );

  // Handle battle events and map to sounds
  const handleBattleEvent = useCallback(
    (event: BattleEvent, context?: BattleAudioContext) => {
      if (!enabled || prefersReducedMotion.current) return;

      switch (event.type) {
        case "battle_start":
          playSFX("effects/battle-start.mp3", 0.8);
          // Music will be started separately based on context
          break;

        case "move_used":
          // Play type-specific move sound if available
          // For now, use a generic move sound - context would need move type
          playSFX("effects/hit.mp3", 0.6, 1.2);
          break;

        case "move_missed":
          playSFX("effects/hit-miss.mp3", 0.7);
          break;

        case "damage_dealt":
          {
            let hitVolume = 0.8;
            let hitPitch = 1.0;
            let effectivenessSound: string | null = null;

            // Adjust based on effectiveness if provided
            if (context?.effectiveness !== undefined) {
              const eff = context.effectiveness;
              if (eff === 0) {
                effectivenessSound = "effects/effectiveness-no-effect.mp3";
                hitVolume = 0.3;
              } else if (eff >= 2) {
                effectivenessSound = "effects/effectiveness-super.mp3";
                hitVolume = 1.0;
                hitPitch = 1.3;
              } else if (eff <= 0.5) {
                effectivenessSound = "effects/effectiveness-not-very.mp3";
                hitVolume = 0.5;
                hitPitch = 0.7;
              }
            }

            playSFX("effects/hit.mp3", hitVolume, hitPitch);
            
            if (effectivenessSound) {
              // Play effectiveness sound slightly delayed
              setTimeout(() => {
                playSFX(effectivenessSound!, 0.9);
              }, 100);
            }
          }
          break;

        case "status_applied":
          {
            const statusType = event.status.type;
            playSFX(`status/status-${statusType}.mp3`, 0.7);
          }
          break;

        case "status_damage":
          playSFX(`status/status-${event.statusType}.mp3`, 0.5, 0.9);
          break;

        case "status_healed":
          playSFX("status/status-heal.mp3", 0.8);
          break;

        case "stat_changed":
          if (event.newStage > event.oldStage) {
            playSFX("stats/stat-up.mp3", 0.4, 1.1);
          } else {
            playSFX("stats/stat-down.mp3", 0.4, 0.9);
          }
          break;

        case "faint":
          playSFX("effects/faint.mp3", 1.0, 0.8);
          break;

        case "turn_start":
        case "turn_end":
          // Silent events, no sounds needed
          break;
      }
    },
    [enabled, playSFX]
  );

  // Reset audio state
  const reset = useCallback(async () => {
    await stopMusic(false);
    activeSFXRef.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    activeSFXRef.current.clear();
  }, [stopMusic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
      if (musicFadeIntervalRef.current) {
        clearInterval(musicFadeIntervalRef.current);
      }
    };
  }, [reset]);

  // Update music volume when store values change
  useEffect(() => {
    if (currentMusicRef.current) {
      currentMusicRef.current.volume = masterVolume * musicVolume;
    }
  }, [masterVolume, musicVolume]);

  return {
    preloadSound,
    playSFX,
    playMusic,
    stopMusic,
    setMusicVolume,
    handleBattleEvent,
    reset,
  };
}

