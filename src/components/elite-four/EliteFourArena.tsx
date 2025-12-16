"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useEliteFour } from "@/hooks/useEliteFour";
import { EliteFourLobby } from "./EliteFourLobby";
import { EliteFourProgress } from "./EliteFourProgress";
import { EliteFourVictory } from "./EliteFourVictory";
import { EliteFourDefeat } from "./EliteFourDefeat";
import { PokemonPanel } from "@/components/battle/PokemonPanel";
import { MoveSelector } from "@/components/battle/MoveSelector";
import { BattleLog } from "@/components/battle/BattleLog";
import { BattleControls } from "@/components/battle/BattleControls";
import { EffectivenessIndicator } from "@/components/battle/EffectivenessIndicator";
import { TypeParticles } from "@/components/battle/TypeParticles";
import { calculateMoveEffectiveness, type Effectiveness } from "@/lib/utils/battleHelpers";
import { getAllEliteFourConfigs } from "@/data/eliteFour";
import type { Pokemon as APIPokemon } from "@/types/api";
import type { AnimationSpeed } from "@/hooks/useBattleAnimation";
import { useEliteFourCareerStore } from "@/store/eliteFourCareerStore";

export function EliteFourArena() {
  const eliteFour = useEliteFour();
  const { gameMode, getMasterModeProgress } = useEliteFourCareerStore();
  const {
    status,
    currentOpponentIndex,
    userPokemon,
    config,
    defeatedOpponents,
    currentOpponent,
    opponentPokemon,
    roundWins,
    currentRound,
    battle,
    startRun,
    resetRun,
  } = eliteFour;

  const [animationSpeed, setAnimationSpeed] = useState<AnimationSpeed>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  
  // Battle view container dimensions for particle positioning
  const battleViewRef = useRef<HTMLDivElement>(null);
  const [battleViewDimensions, setBattleViewDimensions] = useState({ width: 1200, height: 400 });

  // Measure actual battle view container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (battleViewRef.current) {
        const rect = battleViewRef.current.getBoundingClientRect();
        setBattleViewDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);
  
  // Animation states
  const [pokemon1Attacking, setPokemon1Attacking] = useState(false);
  const [pokemon2Attacking, setPokemon2Attacking] = useState(false);
  const [pokemon1AttackType, setPokemon1AttackType] = useState<string | null>(null);
  const [pokemon2AttackType, setPokemon2AttackType] = useState<string | null>(null);
  const [pokemon1TakingDamage, setPokemon1TakingDamage] = useState(false);
  const [pokemon2TakingDamage, setPokemon2TakingDamage] = useState(false);
  const [effectiveness, setEffectiveness] = useState<Effectiveness | null>(null);
  
  const previousLogLengthRef = useRef(0);
  const currentTurnMoveTypesRef = useRef<{ move1Type: string | null; move2Type: string | null }>({
    move1Type: null,
    move2Type: null,
  });

  const {
    battleState,
    pokemon1Moves,
    pokemon2Moves,
    pokemon1Sprite,
    pokemon2Sprite,
    isLoading,
    executeTurn,
    getActivePokemon,
    isBattleFinished,
    getWinner,
    resetBattle,
  } = battle;

  // Reset log tracking when battle starts
  useEffect(() => {
    if (battleState && battleState.log.length > 0) {
      if (battleState.log[0]?.type === "battle_start") {
        previousLogLengthRef.current = 1;
      }
    }
  }, [battleState?.turnNumber]);

  // Process battle events for animations
  useEffect(() => {
    if (!battleState) return;

    const currentLogLength = battleState.log.length;
    if (currentLogLength === previousLogLengthRef.current) return;

    const newEvents = battleState.log.slice(previousLogLengthRef.current);
    previousLogLengthRef.current = currentLogLength;

    const currentPokemon1 = getActivePokemon(0);
    const currentPokemon2 = getActivePokemon(1);

    newEvents.forEach((event) => {
      if (event.type === "move_used") {
        const moves = event.pokemonIndex === 0 ? pokemon1Moves : pokemon2Moves;
        const move = moves.find((m) => m.name === event.moveName);
        
        if (move) {
          if (event.pokemonIndex === 0) {
            setPokemon1Attacking(true);
            setPokemon1AttackType(move.type);
            currentTurnMoveTypesRef.current.move1Type = move.type;
          } else {
            setPokemon2Attacking(true);
            setPokemon2AttackType(move.type);
            currentTurnMoveTypesRef.current.move2Type = move.type;
          }
        }
      } else if (event.type === "damage_dealt") {
        if (event.pokemonIndex === 0) {
          setPokemon1TakingDamage(true);
          if (currentTurnMoveTypesRef.current.move2Type && currentPokemon1) {
            const eff = calculateMoveEffectiveness(
              currentTurnMoveTypesRef.current.move2Type,
              currentPokemon1.pokemon.types
            );
            setEffectiveness(eff);
          }
        } else {
          setPokemon2TakingDamage(true);
          if (currentTurnMoveTypesRef.current.move1Type && currentPokemon2) {
            const eff = calculateMoveEffectiveness(
              currentTurnMoveTypesRef.current.move1Type,
              currentPokemon2.pokemon.types
            );
            setEffectiveness(eff);
          }
        }
      }
    });
  }, [battleState, pokemon1Moves, pokemon2Moves, getActivePokemon]);

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || !battle.battle || isBattleFinished()) {
      return;
    }

    const baseDelay = 2500 / animationSpeed;
    const interval = setInterval(() => {
      if (!battle.battle || isBattleFinished() || battle.isAnimating) {
        setIsAutoPlaying(false);
        return;
      }

      const move1Index = Math.floor(Math.random() * pokemon1Moves.length);
      const move2Index = Math.floor(Math.random() * pokemon2Moves.length);
      executeTurn(move1Index, move2Index);
    }, baseDelay);

    return () => clearInterval(interval);
  }, [isAutoPlaying, battle.battle, pokemon1Moves.length, pokemon2Moves.length, isBattleFinished, battle.isAnimating, executeTurn, animationSpeed]);

  // Reset effectiveness after display
  useEffect(() => {
    if (effectiveness !== null) {
      const timer = setTimeout(() => {
        setEffectiveness(null);
      }, 2000 / animationSpeed);
      return () => clearTimeout(timer);
    }
  }, [effectiveness, animationSpeed]);

  const handleAutoPlay = () => {
    setIsAutoPlaying(true);
  };

  const handlePause = () => {
    setIsAutoPlaying(false);
  };

  // Load opponent Pokemon data for progress display
  const [opponentPokemonList, setOpponentPokemonList] = useState<APIPokemon[]>([]);
  
  useEffect(() => {
    if (config && status !== "lobby") {
      const loadOpponents = async () => {
        try {
          const { getPokemonById } = await import("@/lib/api/pokemon");
          const pokemonIds = [
            ...config.members.map((m) => m.pokemonId),
            config.champion.pokemonId,
          ];
          const pokemonPromises = pokemonIds.map((id) => getPokemonById(id));
          const pokemon = await Promise.all(pokemonPromises);
          setOpponentPokemonList(pokemon);
        } catch (error) {
          console.error("Error loading opponent Pokemon:", error);
        }
      };
      loadOpponents();
    }
  }, [config, status]);

  // Render based on status
  if (status === "lobby") {
    const availableRegions = getAllEliteFourConfigs();
    const defaultConfig = config || availableRegions[0];
    const handleStart = (
      userPokemon: APIPokemon, 
      selectedMoves: import("@/battle-engine").Move[], 
      selectedConfig: import("@/data/eliteFour").EliteFourConfig
    ) => {
      // Use the config selected in the lobby
      startRun(userPokemon, selectedConfig, selectedMoves);
    };
    
    return (
      <EliteFourLobby
        config={defaultConfig}
        onStart={handleStart}
        isStarting={isLoading}
      />
    );
  }

  if (status === "victory" && userPokemon && config) {
    return (
      <EliteFourVictory
        config={config}
        userPokemon={userPokemon}
        onRestart={resetRun}
        onContinueCareer={resetRun} // For now, same as restart - will implement actual continuation later
      />
    );
  }

  if (status === "defeated" && userPokemon && config) {
    return (
      <EliteFourDefeat
        config={config}
        userPokemon={userPokemon}
        defeatedBy={currentOpponent}
        defeatedByPokemon={opponentPokemon}
        defeatedOpponents={defeatedOpponents}
        onRestart={resetRun}
      />
    );
  }

  // Battle view
  if (status === "battling" && battleState && userPokemon && config) {
    const pokemon1 = getActivePokemon(0);
    const pokemon2 = getActivePokemon(1);
    const finished = isBattleFinished();

    const isFinalRound = currentRound === 3 && roundWins.user === 1 && roundWins.opponent === 1;
    const isMasterMode = gameMode === "master";
    const masterModeProgress = isMasterMode ? getMasterModeProgress() : null;

    return (
      <div className="space-y-6">
        {/* Master Mode Progress Indicator */}
        {isMasterMode && masterModeProgress && config && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 shadow-lg dark:from-purple-900/30 dark:to-indigo-900/30"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👑</span>
                <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  Master Mode
                </span>
              </div>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                Region {masterModeProgress.current} of {masterModeProgress.total}
              </span>
            </div>
            <div className="mb-2">
              <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                {config.name}
              </div>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-purple-200 dark:bg-purple-900/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(masterModeProgress.completed / masterModeProgress.total) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-purple-600 dark:text-purple-400">
              <span>
                Completed: {masterModeProgress.completed}/{masterModeProgress.total} regions
              </span>
              <span>
                Current: {masterModeProgress.current}/{masterModeProgress.total}
              </span>
            </div>
          </motion.div>
        )}

        {/* Progress Indicator */}
        <EliteFourProgress
          config={config}
          currentOpponentIndex={currentOpponentIndex}
          defeatedOpponents={defeatedOpponents}
          userPokemon={userPokemon}
          opponentPokemon={opponentPokemonList}
          currentRound={currentRound}
          roundWins={roundWins}
        />

        {/* Opponent Title */}
        {currentOpponent && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {currentOpponent.title}
            </h2>
          </div>
        )}

        {/* Round Information - Moved here to be closer to battle */}
        {currentOpponent && currentOpponentIndex !== null && (
          <div className="rounded-lg border-2 border-purple-300 bg-white p-3 shadow-md dark:border-purple-600 dark:bg-gray-800">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {isFinalRound ? "Final Round" : `Round ${currentRound}/3`}
                </span>
                {isFinalRound && (
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    (Deciding Round)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-lg font-bold">
                <span className="text-blue-600 dark:text-blue-400">
                  You {roundWins.user}
                </span>
                <span className="text-gray-400">-</span>
                <span className="text-red-600 dark:text-red-400">
                  {roundWins.opponent} {currentOpponent.name}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Effectiveness Indicator - At top on desktop */}
        {effectiveness !== null && effectiveness !== 1 && (
          <div className="pointer-events-none relative hidden lg:block" style={{ height: '60px' }}>
            <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
              <EffectivenessIndicator
                effectiveness={effectiveness}
                speedMultiplier={animationSpeed}
              />
            </div>
          </div>
        )}

        {/* Battle View */}
        <div className="relative" ref={battleViewRef}>
          {/* Type Particles */}
          {pokemon1Attacking && pokemon1AttackType && (
            <TypeParticles
              type={pokemon1AttackType}
              fromPosition="left"
              toPosition="right"
              containerWidth={battleViewDimensions.width}
              containerHeight={battleViewDimensions.height}
              speedMultiplier={animationSpeed}
            />
          )}
          {pokemon2Attacking && pokemon2AttackType && (
            <TypeParticles
              type={pokemon2AttackType}
              fromPosition="right"
              toPosition="left"
              containerWidth={battleViewDimensions.width}
              containerHeight={battleViewDimensions.height}
              speedMultiplier={animationSpeed}
            />
          )}

          {/* Mobile: Pokemon side by side, Controls below */}
          {/* Desktop: 3-column layout with controls between Pokemon */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6 items-stretch">
            {/* Left Pokemon (User) */}
            <div className="col-span-1 lg:col-span-1">
              {pokemon1 && (
                <PokemonPanel
                  activePokemon={pokemon1}
                  spriteUrl={pokemon1Sprite}
                  position="left"
                  isAnimating={battle.isAnimating}
                  isAttacking={pokemon1Attacking}
                  attackType={pokemon1AttackType}
                  onAttackComplete={() => {
                    setPokemon1Attacking(false);
                    setPokemon1AttackType(null);
                  }}
                  isTakingDamage={pokemon1TakingDamage}
                  onDamageComplete={() => {
                    setPokemon1TakingDamage(false);
                  }}
                  speedMultiplier={animationSpeed}
                />
              )}
            </div>

            {/* Center: Move Selector & Controls - Below Pokemon on mobile, between Pokemon on desktop */}
            <div className="col-span-2 lg:col-span-1 order-3 lg:order-2 space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
                <h3 className="mb-4 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Turn {battleState.turnNumber}
                </h3>

                {!finished && (
                  <MoveSelector
                    moves={pokemon1Moves}
                    pokemonIndex={0}
                    activePokemon={pokemon1}
                    onMoveSelect={(moveIndex) => {
                      const opponentMoveIndex = Math.floor(
                        Math.random() * pokemon2Moves.length
                      );
                      executeTurn(moveIndex, opponentMoveIndex);
                    }}
                    disabled={battle.isAnimating || finished}
                  />
                )}

                {finished && (
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {getWinner() !== null
                        ? `${getWinner() === 0 ? pokemon1?.pokemon.name : pokemon2?.pokemon.name} wins!`
                        : "Battle finished"}
                    </p>
                  </div>
                )}
              </div>

              <BattleControls
                onReset={() => {
                  resetBattle();
                  resetRun();
                }}
                onAutoPlay={handleAutoPlay}
                onPause={handlePause}
                isAutoPlaying={isAutoPlaying}
                canReplay={false}
                animationSpeed={animationSpeed}
                onSpeedChange={setAnimationSpeed}
              />
            </div>

            {/* Right Pokemon (Opponent) - Next to left on mobile, right column on desktop */}
            <div className="relative col-span-1 lg:col-span-1 order-2 lg:order-3">
              {/* Effectiveness Indicator - Above opponent on mobile */}
              {effectiveness !== null && effectiveness !== 1 && (
                <div className="pointer-events-none absolute -top-12 left-1/2 z-50 -translate-x-1/2 lg:hidden">
                  <EffectivenessIndicator
                    effectiveness={effectiveness}
                    speedMultiplier={animationSpeed}
                  />
                </div>
              )}
              {pokemon2 && (
                <PokemonPanel
                  activePokemon={pokemon2}
                  spriteUrl={pokemon2Sprite}
                  position="right"
                  isAnimating={battle.isAnimating}
                  isAttacking={pokemon2Attacking}
                  attackType={pokemon2AttackType}
                  onAttackComplete={() => {
                    setPokemon2Attacking(false);
                    setPokemon2AttackType(null);
                  }}
                  isTakingDamage={pokemon2TakingDamage}
                  onDamageComplete={() => {
                    setPokemon2TakingDamage(false);
                  }}
                  speedMultiplier={animationSpeed}
                />
              )}
            </div>
          </div>
        </div>

        {/* Battle Log */}
        {battleState && (
          <BattleLog
            log={battleState.log}
            pokemon1Name={pokemon1?.pokemon.name ?? userPokemon.name}
            pokemon2Name={pokemon2?.pokemon.name ?? opponentPokemon?.name ?? "Opponent"}
          />
        )}
      </div>
    );
  }

  // Loading state - show when status is battling but battleState is not ready
  if (status === "battling") {
    // Show loading if battle is loading or battleState is not available yet
    if (isLoading || !battleState) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">Loading battle...</p>
            {isLoading && <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Initializing battle...</p>}
          </div>
        </div>
      );
    }
  }

  // Fallback loading state
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading battle...</p>
      </div>
    </div>
  );
}

