"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Pokemon as APIPokemon } from "@/types/api";
import { useBattle, type UseBattleReturn } from "./useBattle";
import { getPokemonById } from "@/lib/api/pokemon";
import { getPokemonMoves } from "@/lib/pokemon-api/normalizeForBattle";
import type { EliteFourConfig, EliteFourMember, EliteFourChampion } from "@/data/eliteFour";
import type { Move as EngineMove } from "@/battle-engine";
import { useEliteFourCareerStore } from "@/store/eliteFourCareerStore";

export type EliteFourStatus = "lobby" | "battling" | "defeated" | "victory";

export interface UseEliteFourReturn {
  // State
  status: EliteFourStatus;
  currentOpponentIndex: number | null; // 0-3 for members, 4 for champion, null when not battling
  userPokemon: APIPokemon | null;
  config: EliteFourConfig | null;
  defeatedOpponents: string[]; // IDs of defeated opponents
  currentOpponent: EliteFourMember | EliteFourChampion | null;
  opponentPokemon: APIPokemon | null;
  roundWins: { user: number; opponent: number }; // Round wins for current matchup
  currentRound: number; // Current round number (1, 2, or 3)
  
  // Battle hook instance
  battle: UseBattleReturn;
  
  // Actions
  startRun: (userPokemon: APIPokemon, config: EliteFourConfig, selectedMoves?: EngineMove[]) => Promise<void>;
  startNextBattle: () => Promise<void>;
  onBattleWin: () => void;
  onBattleLoss: () => void;
  resetRun: () => void;
  pauseProgression: () => void;
  resumeProgression: () => void;
  
  // Getters
  isChampionBattle: () => boolean;
  getCurrentOpponentTitle: () => string | null;
}

/**
 * Custom hook for managing Elite Four challenge
 * Orchestrates sequential battles using the battle engine
 */
export function useEliteFour(): UseEliteFourReturn {
  const {
    gameMode,
    completeRegion,
    completeMasterModeRegion,
    getMasterModeCurrentRegion,
    getMasterModeProgress,
  } = useEliteFourCareerStore();
  
  const [status, setStatus] = useState<EliteFourStatus>("lobby");
  const [currentOpponentIndex, setCurrentOpponentIndex] = useState<number | null>(null);
  const [userPokemon, setUserPokemon] = useState<APIPokemon | null>(null);
  const [config, setConfig] = useState<EliteFourConfig | null>(null);
  const [defeatedOpponents, setDefeatedOpponents] = useState<string[]>([]);
  const [opponentPokemon, setOpponentPokemon] = useState<APIPokemon | null>(null);
  const [userSelectedMoves, setUserSelectedMoves] = useState<EngineMove[] | null>(null);
  const [roundWins, setRoundWins] = useState<{ user: number; opponent: number }>({ user: 0, opponent: 0 });
  const [currentRound, setCurrentRound] = useState<number>(1);
  
  // Use battle hook for individual battles
  const battle = useBattle();
  
  // Track if we've already processed this battle result to prevent duplicate processing
  const battleProcessedRef = useRef<string | null>(null);
  // Track the last processed opponent index to ensure we only process the current battle
  const lastProcessedOpponentIndexRef = useRef<number | null>(null);
  // Track if we've already started a battle for this round/opponent combo
  const battleStartedForRoundRef = useRef<string | null>(null);
  // Track if we're currently in the process of starting a battle (to prevent cleanup from canceling)
  const isStartingBattleRef = useRef<boolean>(false);
  // Track auto-advance timeout for Master Mode
  const masterModeAutoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track if progression should be paused (e.g., when summary screen is showing)
  const isPausedRef = useRef<boolean>(false);
  // Track pending advancement when matchup completes but progression is paused
  const pendingAdvancementRef = useRef<(() => void) | null>(null);
  
  /**
   * Get current opponent (member or champion)
   */
  const getCurrentOpponent = useCallback((): EliteFourMember | EliteFourChampion | null => {
    if (!config || currentOpponentIndex === null) return null;
    
    if (currentOpponentIndex < config.members.length) {
      return config.members[currentOpponentIndex];
    } else if (currentOpponentIndex === config.members.length) {
      return config.champion;
    }
    
    return null;
  }, [config, currentOpponentIndex]);

  /**
   * Reset round state for new opponent matchup
   */
  const resetRoundState = useCallback(() => {
    setRoundWins({ user: 0, opponent: 0 });
    setCurrentRound(1);
  }, []);
  
  /**
   * Start Elite Four challenge
   */
  const startRun = useCallback(
    async (pokemon: APIPokemon, eliteFourConfig: EliteFourConfig, selectedMoves?: EngineMove[]) => {
      setUserPokemon(pokemon);
      setConfig(eliteFourConfig);
      setDefeatedOpponents([]);
      setOpponentPokemon(null);
      setCurrentOpponentIndex(0);
      setUserSelectedMoves(selectedMoves || null);
      resetRoundState(); // Reset round state for first opponent
      setStatus("battling");
      // Battle will start via useEffect when currentOpponentIndex changes
    },
    [resetRoundState]
  );
  
  /**
   * Start battle with current opponent
   */
  const startNextBattle = useCallback(async () => {
    console.log("startNextBattle called", { config: !!config, currentOpponentIndex, userPokemon: !!userPokemon });
    
    if (!config || currentOpponentIndex === null || !userPokemon) {
      console.log("startNextBattle: Early return - missing required data");
      isStartingBattleRef.current = false;
      return;
    }
    
    const opponent = getCurrentOpponent();
    if (!opponent) {
      console.log("startNextBattle: Early return - no opponent");
      isStartingBattleRef.current = false;
      return;
    }
    
    console.log(`startNextBattle: Starting battle for ${opponent.title}, round ${currentRound}`);
    
    try {
      // Reset battle processed tracker for new battle/round
      battleProcessedRef.current = null;
      
      // Only reset opponent Pokemon if it's a new opponent
      // For round advances, keep the same opponent Pokemon
      const currentOpponentPoke = opponentPokemon;
      let opponentPoke = currentOpponentPoke;
      
      if (!opponentPoke || opponentPoke.id !== opponent.pokemonId) {
        // New opponent - fetch Pokemon
        console.log(`startNextBattle: Fetching opponent Pokemon ${opponent.pokemonId}`);
        // Don't set to null here to avoid triggering useEffect re-run
        // We'll set it directly to the fetched Pokemon
        opponentPoke = await getPokemonById(opponent.pokemonId);
        console.log(`startNextBattle: Fetched opponent Pokemon: ${opponentPoke.name}`);
        setOpponentPokemon(opponentPoke);
      } else {
        console.log(`startNextBattle: Using existing opponent Pokemon: ${opponentPoke.name}`);
      }
      
      // Reset battle hook for fresh battle (ensures HP resets)
      console.log("startNextBattle: Resetting battle");
      battle.resetBattle();
      
      // Get opponent moves (always fetch, user might have selected moves)
      console.log("startNextBattle: Fetching opponent moves");
      const opponentMoves = await getPokemonMoves(opponentPoke, 4);
      console.log(`startNextBattle: Got ${opponentMoves.length} opponent moves`);
      
      // Start battle - user is always pokemon1 (index 0)
      // Use selected moves for user if available, otherwise battle will fetch automatically
      // Include round number in seed for variety between rounds
      const seed = Date.now() + currentOpponentIndex * 100 + currentRound;
      console.log("startNextBattle: Calling battle.startBattle", {
        userPokemon: userPokemon.name,
        opponentPokemon: opponentPoke.name,
        seed,
        userMoves: userSelectedMoves?.length || 0,
        opponentMoves: opponentMoves.length
      });
      await battle.startBattle(
        userPokemon, 
        opponentPoke, 
        seed,
        userSelectedMoves || undefined,
        opponentMoves.length > 0 ? opponentMoves : undefined
      );
      console.log("startNextBattle: battle.startBattle completed");
      
      // Mark that we've successfully started a battle for this round
      const roundKey = `${currentOpponentIndex}-${currentRound}`;
      battleStartedForRoundRef.current = roundKey;
      isStartingBattleRef.current = false;
      
      console.log(`✓ Started round ${currentRound} for opponent index: ${currentOpponentIndex}, ${opponent.title}`);
    } catch (error) {
      console.error("Failed to start Elite Four battle:", error);
      console.error("Error details:", error instanceof Error ? error.stack : error);
      // Reset the ref on error so we can retry
      battleStartedForRoundRef.current = null;
      isStartingBattleRef.current = false;
      // Re-throw to allow error handling upstream if needed
      throw error;
    }
  }, [config, currentOpponentIndex, currentRound, userPokemon, userSelectedMoves, opponentPokemon, battle, getCurrentOpponent]);
  
  /**
   * Handle battle win - check if won matchup (2 rounds) or continue to next round
   */
  const onBattleWin = useCallback(() => {
    if (!config || currentOpponentIndex === null) {
      console.warn("onBattleWin called without config or currentOpponentIndex");
      return;
    }
    
    const opponent = getCurrentOpponent();
    if (!opponent) {
      console.warn("onBattleWin: Could not get current opponent");
      return;
    }
    
    // Increment user's round wins
    setRoundWins((prev) => {
      const newWins = { ...prev, user: prev.user + 1 };
      console.log(`Round ${currentRound} won by user. Score: ${newWins.user} - ${prev.opponent}`);
      
      // Check if user won the matchup (2 wins)
      if (newWins.user === 2) {
        // Win the matchup
        const membersCount = config.members.length;
        const isChampion = currentOpponentIndex === membersCount;
        
        // Add opponent to defeated list
        setDefeatedOpponents((prevDefeated) => {
          if (prevDefeated.includes(opponent.id)) {
            return prevDefeated;
          }
          return [...prevDefeated, opponent.id];
        });
        
        if (isChampion) {
          // Defeated Champion - Victory!
          console.log("✓ Champion defeated! Showing victory screen.");
          
          // Track region completion based on mode
          if (gameMode === "career" && config) {
            // Use setTimeout to defer both store update and state update to avoid React render issues
            setTimeout(() => {
              completeRegion(config.id);
              setStatus("victory");
            }, 0);
          } else if (gameMode === "master" && config) {
            // Get progress BEFORE updating to avoid React render issues
            const currentProgress = getMasterModeProgress();
            const currentCompletedCount = currentProgress.completed;
            const totalRegions = currentProgress.total;
            
            // Complete the region
            completeMasterModeRegion(config.id);
            
            // Calculate if complete (will be currentCompletedCount + 1 after update)
            const willBeComplete = (currentCompletedCount + 1) >= totalRegions;
            
            if (willBeComplete) {
              // Master Mode complete! Show completion screen
              console.log("🏆 Master Mode completed!");
              setStatus("victory");
            } else {
              // Master Mode not complete - need to get next region after a brief delay
              // Use setTimeout to defer the state reads to avoid render issues
              setTimeout(() => {
                const nextRegion = getMasterModeCurrentRegion();
                if (nextRegion && userPokemon && userSelectedMoves) {
                  console.log(`→ Master Mode: Auto-advancing to ${nextRegion.name} in 3 seconds...`);
                  
                  // Clear any existing timeout
                  if (masterModeAutoAdvanceTimeoutRef.current) {
                    clearTimeout(masterModeAutoAdvanceTimeoutRef.current);
                  }
                  
                  // Set auto-advance timeout (3 seconds)
                  masterModeAutoAdvanceTimeoutRef.current = setTimeout(() => {
                    console.log(`→ Master Mode: Starting ${nextRegion.name}`);
                    
                    // Reset state for next region
                    resetRoundState();
                    setOpponentPokemon(null);
                    setDefeatedOpponents([]);
                    setCurrentOpponentIndex(0);
                    
                    // Reset battle state
                    battle.resetBattle();
                    battleProcessedRef.current = null;
                    lastProcessedOpponentIndexRef.current = null;
                    battleStartedForRoundRef.current = null;
                    isStartingBattleRef.current = false;
                    
                    // Start next region with same Pokemon and moves
                    setConfig(nextRegion);
                    setStatus("battling");
                    
                    // Clear the timeout ref
                    masterModeAutoAdvanceTimeoutRef.current = null;
                    
                    // Battle will start via useEffect when config and status change
                  }, 3000); // 3 second delay
                }
              }, 0); // Defer to next tick
              
              // Show victory screen
              setStatus("victory");
            }
          } else {
            setStatus("victory");
          }
        } else {
          // Not the champion yet - continue to next opponent
          // BUT check if progression is paused - if so, defer advancement until resume
          if (isPausedRef.current) {
            console.log("→ Matchup won but progression paused - deferring advancement");
            // Store the advancement logic to execute when progression resumes
            pendingAdvancementRef.current = () => {
              console.log(`→ Matchup won! Moving to next opponent. Current index: ${currentOpponentIndex}, Next index: ${currentOpponentIndex + 1}`);
              
              // Reset round state for new opponent
              resetRoundState();
              
              // Reset opponent Pokemon to trigger useEffect for next battle
              setOpponentPokemon(null);
              
              // Advance to next opponent (useEffect will start next battle)
              const nextIndex = currentOpponentIndex + 1;
              
              setCurrentOpponentIndex((prevIndex) => {
                if (prevIndex !== currentOpponentIndex) {
                  console.warn(`currentOpponentIndex mismatch: prev=${prevIndex}, current=${currentOpponentIndex}`);
                }
                return nextIndex;
              });
              
              setStatus((prevStatus) => {
                if (prevStatus !== "battling") {
                  console.warn(`Status was ${prevStatus}, forcing to 'battling'`);
                }
                return "battling";
              });
              
              pendingAdvancementRef.current = null;
            };
            return newWins;
          }
          
          // Not paused - advance immediately
          console.log(`→ Matchup won! Moving to next opponent. Current index: ${currentOpponentIndex}, Next index: ${currentOpponentIndex + 1}`);
          
          // Reset round state for new opponent
          resetRoundState();
          
          // Reset opponent Pokemon to trigger useEffect for next battle
          setOpponentPokemon(null);
          
          // Advance to next opponent (useEffect will start next battle)
          const nextIndex = currentOpponentIndex + 1;
          
          setCurrentOpponentIndex((prevIndex) => {
            if (prevIndex !== currentOpponentIndex) {
              console.warn(`currentOpponentIndex mismatch: prev=${prevIndex}, current=${currentOpponentIndex}`);
            }
            return nextIndex;
          });
          
          setStatus((prevStatus) => {
            if (prevStatus !== "battling") {
              console.warn(`Status was ${prevStatus}, forcing to 'battling'`);
            }
            return "battling";
          });
        }
      } else {
        // Continue to next round (user won but doesn't have 2 wins yet)
        const nextRound = currentRound + 1;
        console.log(`→ Round ${currentRound} won. Continuing to round ${nextRound}`);
        // DON'T clear battleProcessedRef here - we need to keep it to prevent reprocessing the same battle
        // The battleKey includes the round number, so different rounds will have different keys
        // DON'T clear battleStartedForRoundRef here - we need it to extract the round number
        // The next battle start will overwrite it with the new round key
        // Increment round - this will trigger useEffect to start next battle
        setCurrentRound(nextRound);
        // Battle will reset and start next round via startNextBattle
      }
      
      return newWins;
    });
  }, [config, currentOpponentIndex, currentRound, getCurrentOpponent, resetRoundState]);
  
  /**
   * Handle battle loss - check if lost matchup (2 losses) or continue to next round
   */
  const onBattleLoss = useCallback(() => {
    // Increment opponent's round wins
    setRoundWins((prev) => {
      // Use functional update to ensure we're working with latest state
      const currentWins = prev;
      const newWins = { ...currentWins, opponent: currentWins.opponent + 1 };
      console.log(`Round ${currentRound} won by opponent. Score: ${currentWins.user} - ${newWins.opponent}`);
      
      // Check if opponent won the matchup (2 wins)
      if (newWins.opponent === 2) {
        // Lost the matchup - end the run
        // Champion loss always ends challenge, no pause needed
        // For Elite Four members, we want to show summary first
        if (isPausedRef.current) {
          // Store the defeat logic to execute when progression resumes
          pendingAdvancementRef.current = () => {
            console.log("✗ Matchup lost! Ending challenge.");
            setStatus("defeated");
            pendingAdvancementRef.current = null;
          };
          return newWins;
        }
        
        console.log("✗ Matchup lost! Ending challenge.");
        setStatus("defeated");
      } else {
        // Continue to next round (opponent won but doesn't have 2 wins yet)
        const nextRound = currentRound + 1;
        console.log(`→ Round ${currentRound} lost. Continuing to round ${nextRound}`);
        // DON'T clear battleProcessedRef here - we need to keep it to prevent reprocessing the same battle
        // The battleKey includes the round number, so different rounds will have different keys
        // DON'T clear battleStartedForRoundRef here - we need it to extract the round number
        // The next battle start will overwrite it with the new round key
        // Increment round - this will trigger useEffect to start next battle
        setCurrentRound(nextRound);
        // Battle will reset and start next round via startNextBattle
      }
      
      return newWins;
    });
  }, [currentRound]);
  
  /**
   * Reset to lobby state
   */
  const resetRun = useCallback(() => {
    // Clear auto-advance timeout if exists
    if (masterModeAutoAdvanceTimeoutRef.current) {
      clearTimeout(masterModeAutoAdvanceTimeoutRef.current);
      masterModeAutoAdvanceTimeoutRef.current = null;
    }
    
    setStatus("lobby");
    setCurrentOpponentIndex(null);
    setUserPokemon(null);
    setConfig(null);
    setDefeatedOpponents([]);
    setOpponentPokemon(null);
    setUserSelectedMoves(null);
    resetRoundState();
    battleProcessedRef.current = null; // Reset processed battles tracker
    lastProcessedOpponentIndexRef.current = null; // Reset last processed opponent index
    battleStartedForRoundRef.current = null; // Reset battle started tracker
    battle.resetBattle();
  }, [battle, resetRoundState]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (masterModeAutoAdvanceTimeoutRef.current) {
        clearTimeout(masterModeAutoAdvanceTimeoutRef.current);
      }
    };
  }, []);
  
  /**
   * Check if current battle is against Champion
   */
  const isChampionBattle = useCallback((): boolean => {
    if (!config || currentOpponentIndex === null) return false;
    return currentOpponentIndex === config.members.length;
  }, [config, currentOpponentIndex]);
  
  /**
   * Get current opponent's title
   */
  const getCurrentOpponentTitle = useCallback((): string | null => {
    const opponent = getCurrentOpponent();
    return opponent?.title || null;
  }, [getCurrentOpponent]);
  
  // Monitor battle completion - only process if battle is finished AND it's for the current opponent
  useEffect(() => {
    if (status !== "battling") {
      return;
    }
    
    if (currentOpponentIndex === null) {
      return;
    }
    
    if (!battle.battleState) {
      return;
    }
    
    // CRITICAL CHECK: Ensure we have opponent Pokemon for current opponent
    // This ensures the battle has actually started for this opponent
    if (!opponentPokemon) {
      // Battle hasn't started yet for this opponent, don't process
      return;
    }
    
    // Don't process if we're currently starting a battle
    if (isStartingBattleRef.current) {
      return;
    }
    
    // Get current opponent to verify this battle is for the right opponent
    const currentOpponent = getCurrentOpponent();
    if (!currentOpponent || opponentPokemon.id !== currentOpponent.pokemonId) {
      // Battle Pokemon doesn't match current opponent - this is an old battle
      console.log("Battle Pokemon doesn't match current opponent, skipping", {
        battlePokemonId: opponentPokemon.id,
        currentOpponentId: currentOpponent?.pokemonId,
        currentOpponentIndex
      });
      return;
    }
    
    if (!battle.isBattleFinished()) {
      return;
    }
    
    const winnerIndex = battle.getWinner();
    if (winnerIndex === null) {
      return;
    }
    
    // Extract the round number from battleStartedForRoundRef FIRST, before any checks
    // This is critical: we need to know which round this battle belongs to before we check if it matches
    // If the ref is null, we can't determine the round, so skip processing
    if (!battleStartedForRoundRef.current) {
      console.log("Cannot process battle: battleStartedForRoundRef is null, skipping", {
        currentRound,
        currentOpponentIndex
      });
      return;
    }
    
    // Extract the round number from the ref
    const parts = battleStartedForRoundRef.current.split('-');
    if (parts.length < 2) {
      console.log("Cannot process battle: invalid battleStartedForRoundRef format", {
        ref: battleStartedForRoundRef.current,
        currentRound
      });
      return;
    }
    
    const battleRound = parseInt(parts[1], 10);
    if (isNaN(battleRound)) {
      console.log("Cannot process battle: invalid round number in battleStartedForRoundRef", {
        ref: battleStartedForRoundRef.current,
        currentRound
      });
      return;
    }
    
    // Create a unique key for this battle to prevent duplicate processing
    // Use the extracted battleRound (round the battle was actually started for), not currentRound
    // This prevents issues when currentRound changes between processing calls
    const battleKey = `${currentOpponentIndex}-${battleRound}-${battle.battleState?.turnNumber || 0}-${battle.battleState?.log.length || 0}`;
    
    // Verify this battle matches what we expect - check using the extracted battleRound
    const expectedRoundKey = `${currentOpponentIndex}-${battleRound}`;
    if (battleStartedForRoundRef.current !== expectedRoundKey) {
      // This battle doesn't match - it's from a different round
      console.log("Battle doesn't match expected round, skipping", {
        battleRoundKey: battleStartedForRoundRef.current,
        expectedRoundKey,
        battleRound,
        currentRound
      });
      return;
    }
    if (battleProcessedRef.current === battleKey) {
      // Already processed this exact battle result
      console.log("Battle already processed, skipping:", battleKey);
      return;
    }
    
    console.log("Processing battle completion:", {
      battleKey,
      winnerIndex,
      currentOpponentIndex,
      lastProcessedIndex: lastProcessedOpponentIndexRef.current,
      opponentPokemonId: opponentPokemon.id,
      status
    });
    
    // Mark this battle as processed immediately to prevent duplicate processing
    battleProcessedRef.current = battleKey;
    lastProcessedOpponentIndexRef.current = currentOpponentIndex;
    
    // Delay battle result processing to allow animations and summary screen
    // Check if this battle will complete the matchup BEFORE calling onBattleWin
    // If it will, pause progression so EliteFourArena can show summary first
    const willCompleteMatchup = (winnerIndex === 0 && roundWins.user === 1) || // User wins and had 1 win
                                 (winnerIndex === 1 && roundWins.opponent === 1); // Opponent wins and had 1 win
    
    console.log("Battle completion check:", {
      winnerIndex,
      currentRoundWins: roundWins,
      willCompleteMatchup,
      isPaused: isPausedRef.current,
    });
    
    if (willCompleteMatchup) {
      console.log("This battle will complete the matchup - pausing progression for summary screen");
      isPausedRef.current = true; // Pause immediately so onBattleWin won't advance
    }
    
    setTimeout(() => {
      // Check if progression is paused (e.g., summary screen is showing)
      // If paused, wait and check again
      const checkAndProcess = () => {
        if (isPausedRef.current) {
          // Still paused, check again in 100ms
          console.log("Battle progression paused, waiting for resume...");
          setTimeout(checkAndProcess, 100);
          return;
        }
        
        // Not paused, proceed with battle result processing
        // User is always pokemon1 (index 0)
        if (winnerIndex === 0) {
          // User won
          console.log("User won the battle, calling onBattleWin");
          onBattleWin();
        } else {
          // User lost
          console.log("User lost the battle, calling onBattleLoss");
          onBattleLoss();
        }
      };
      
      checkAndProcess();
    }, 2500); // 2.5 second delay to allow animations
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, battle.battleState, battle.isBattleFinished, battle.getWinner, onBattleWin, onBattleLoss, currentOpponentIndex, currentRound, opponentPokemon?.id, roundWins.user, roundWins.opponent]);
  
  // Reset round state when opponent index changes (new opponent matchup)
  useEffect(() => {
    if (status === "battling" && currentOpponentIndex !== null) {
      // Reset round state when starting a new opponent (but not if we're just continuing rounds)
      // We check if we don't have opponentPokemon yet, meaning it's a fresh opponent
      if (!opponentPokemon) {
        resetRoundState();
        // Reset battle started tracker for new opponent
        battleStartedForRoundRef.current = null;
      }
    }
  }, [currentOpponentIndex, status, opponentPokemon, resetRoundState]);

  // Start battle when opponent index changes and we have all required data
  useEffect(() => {
    if (status !== "battling") {
      return;
    }
    
    if (currentOpponentIndex === null) {
      return;
    }
    
    if (!userPokemon || !config) {
      return;
    }
    
    // Don't start if already loading or currently starting a battle
    if (battle.isLoading || isStartingBattleRef.current) {
      console.log("useEffect: Battle is loading or starting, skipping", { isLoading: battle.isLoading, isStarting: isStartingBattleRef.current });
      return;
    }
    
    // Create a unique key for this round/opponent combo
    const roundKey = `${currentOpponentIndex}-${currentRound}`;
    
    // Check matchup status first
    const matchupComplete = roundWins.user === 2 || roundWins.opponent === 2;
    if (matchupComplete) {
      // Matchup is complete - don't start new battles
      console.log("useEffect: Matchup complete, skipping");
      return;
    }
    
    // Check if we've already started a battle for this exact round
    if (battleStartedForRoundRef.current === roundKey) {
      // Battle already started for this round
      if (battle.battle && !battle.isBattleFinished()) {
        // Battle is still in progress - don't restart
        console.log(`useEffect: Battle already in progress for ${roundKey}, skipping`);
        return;
      }
      // Battle finished for this round
      // If we're still on the same roundKey, the round hasn't advanced yet
      // This means the battle result is being processed or round should advance
      // Wait for processing or round advancement
      console.log(`useEffect: Battle finished for ${roundKey}, waiting for round advancement`);
      return;
    }
    
    // We haven't started a battle for this round yet
    // Check conditions to start a new battle
    
    const isNewOpponent = !opponentPokemon || 
      (getCurrentOpponent() && opponentPokemon.id !== getCurrentOpponent()?.pokemonId);
    const hasBattle = battle.battle !== null;
    const battleFinished = hasBattle && battle.isBattleFinished();
    
    // Determine if we should start a battle
    let shouldStart = false;
    
    if (isNewOpponent) {
      // New opponent - always start
      shouldStart = true;
      console.log(`useEffect: New opponent detected, starting round ${currentRound}`);
    } else if (!hasBattle) {
      // No battle exists - start one
      shouldStart = true;
      console.log(`useEffect: No battle exists, starting round ${currentRound}`);
    } else if (battleFinished) {
      // Battle finished - we should start next round if matchup not complete
      // The round should have advanced (currentRound incremented) after battle was processed
      // If we're here with a new roundKey, it means the round advanced
      shouldStart = true;
      console.log(`useEffect: Battle finished, starting round ${currentRound}`);
    }
    
    if (shouldStart) {
      console.log(`useEffect: Starting battle for ${roundKey}`);
      isStartingBattleRef.current = true;
      
      // Start the battle immediately (no setTimeout needed)
      startNextBattle()
        .then(() => {
          // Mark that battle started successfully
          battleStartedForRoundRef.current = roundKey;
          console.log(`useEffect: Battle started successfully for ${roundKey}`);
        })
        .catch((error) => {
          console.error("Error in startNextBattle:", error);
          console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
          // Reset refs on error to allow retry
          battleStartedForRoundRef.current = null;
          isStartingBattleRef.current = false;
        });
      
      // No cleanup needed since we're not using setTimeout
      return;
    } else {
      console.log("useEffect: shouldStart is false, not starting battle", {
        isNewOpponent,
        hasBattle,
        battleFinished,
        roundKey,
        currentRoundKey: battleStartedForRoundRef.current
      });
    }
  }, [status, currentOpponentIndex, userPokemon, config, opponentPokemon, roundWins, currentRound, battle.battle, battle.isLoading, battle.isBattleFinished, startNextBattle, getCurrentOpponent]);
  
  /**
   * Pause battle progression (e.g., when summary screen is showing)
   */
  const pauseProgression = useCallback(() => {
    isPausedRef.current = true;
    console.log("Battle progression paused");
  }, []);

  /**
   * Resume battle progression (e.g., when summary screen is closed)
   */
  const resumeProgression = useCallback(() => {
    isPausedRef.current = false;
    console.log("Battle progression resumed");
    
    // If there's pending advancement (matchup completed while paused), execute it now
    if (pendingAdvancementRef.current) {
      console.log("Executing pending advancement");
      pendingAdvancementRef.current();
    }
  }, []);

  return {
    status,
    currentOpponentIndex,
    userPokemon,
    config,
    defeatedOpponents,
    currentOpponent: getCurrentOpponent(),
    opponentPokemon,
    roundWins,
    currentRound,
    battle,
    startRun,
    startNextBattle,
    onBattleWin,
    onBattleLoss,
    resetRun,
    pauseProgression,
    resumeProgression,
    isChampionBattle,
    getCurrentOpponentTitle,
  };
}

