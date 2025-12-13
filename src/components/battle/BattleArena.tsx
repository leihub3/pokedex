"use client";

import { useState, useEffect, useRef } from "react";
import { useBattle } from "@/hooks/useBattle";
import { PokemonSelection } from "./PokemonSelection";
import { PokemonPanel } from "./PokemonPanel";
import { MoveSelector } from "./MoveSelector";
import { BattleLog } from "./BattleLog";
import { BattleControls } from "./BattleControls";
import { EffectivenessIndicator } from "./EffectivenessIndicator";
import { TypeParticles } from "./TypeParticles";
import { calculateMoveEffectiveness, type Effectiveness } from "@/lib/utils/battleHelpers";
import type { Pokemon as APIPokemon } from "@/types/api";
import type { AnimationSpeed } from "@/hooks/useBattleAnimation";
import type { BattleEvent } from "@/battle-engine";

export function BattleArena() {
  const {
    battle,
    battleState,
    isAnimating,
    pokemon1Moves,
    pokemon2Moves,
    pokemon1Sprite,
    pokemon2Sprite,
    battleSeed,
    isLoading,
    startBattle,
    executeTurn,
    resetBattle,
    replayBattle,
    getActivePokemon,
    isBattleFinished,
    getWinner,
  } = useBattle();

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [selectedPokemon1, setSelectedPokemon1] =
    useState<APIPokemon | null>(null);
  const [selectedPokemon2, setSelectedPokemon2] =
    useState<APIPokemon | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState<AnimationSpeed>(1);
  
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

  // Reset log tracking when battle starts
  useEffect(() => {
    if (battleState && battleState.log.length > 0) {
      // Only reset if this is a new battle (log starts with battle_start)
      if (battleState.log[0]?.type === "battle_start") {
        previousLogLengthRef.current = 1; // Skip battle_start event
      }
    }
  }, [battleState?.turnNumber]);

  // Process battle events for animations
  useEffect(() => {
    if (!battleState) return;

    const currentLogLength = battleState.log.length;
    if (currentLogLength === previousLogLengthRef.current) return;

    // Get new events since last check
    const newEvents = battleState.log.slice(previousLogLengthRef.current);
    previousLogLengthRef.current = currentLogLength;

    // Get current active Pokemon for effectiveness calculation
    const currentPokemon1 = getActivePokemon(0);
    const currentPokemon2 = getActivePokemon(1);

    // Process events sequentially
    newEvents.forEach((event) => {
      if (event.type === "move_used") {
        // Find move type from moves array
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
        // Trigger damage animation
        if (event.pokemonIndex === 0) {
          setPokemon1TakingDamage(true);
          // Calculate effectiveness for damage to pokemon1 (defender)
          // The attacker is pokemon2, so use pokemon2's move type
          if (currentTurnMoveTypesRef.current.move2Type && currentPokemon1) {
            const eff = calculateMoveEffectiveness(
              currentTurnMoveTypesRef.current.move2Type,
              currentPokemon1.pokemon.types
            );
            setEffectiveness(eff);
          }
        } else {
          setPokemon2TakingDamage(true);
          // Calculate effectiveness for damage to pokemon2 (defender)
          // The attacker is pokemon1, so use pokemon1's move type
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
    if (!isAutoPlaying || !battle || isBattleFinished()) {
      return;
    }

    const baseDelay = 2500 / animationSpeed; // Adjust for speed multiplier
    const interval = setInterval(() => {
      if (!battle || isBattleFinished() || isAnimating) {
        setIsAutoPlaying(false);
        return;
      }

      // Random moves for both Pokemon
      const move1Index = Math.floor(Math.random() * pokemon1Moves.length);
      const move2Index = Math.floor(Math.random() * pokemon2Moves.length);
      executeTurn(move1Index, move2Index);
    }, baseDelay);

    return () => clearInterval(interval);
  }, [isAutoPlaying, battle, pokemon1Moves.length, pokemon2Moves.length, isBattleFinished, isAnimating, executeTurn, animationSpeed]);

  const handleAutoPlay = () => {
    setIsAutoPlaying(true);
  };

  const handlePause = () => {
    setIsAutoPlaying(false);
  };

  const handleReplay = async () => {
    if (selectedPokemon1 && selectedPokemon2) {
      await replayBattle(selectedPokemon1, selectedPokemon2);
    }
  };

  const handlePokemonSelected = async (
    pokemon1: APIPokemon,
    pokemon2: APIPokemon
  ) => {
    setSelectedPokemon1(pokemon1);
    setSelectedPokemon2(pokemon2);
    try {
      await startBattle(pokemon1, pokemon2);
    } catch (error) {
      console.error("Failed to start battle:", error);
      // Error handling could show a toast/alert here
    }
  };

  const handleReset = () => {
    resetBattle();
    setSelectedPokemon1(null);
    setSelectedPokemon2(null);
    // Reset animation states
    setPokemon1Attacking(false);
    setPokemon2Attacking(false);
    setPokemon1AttackType(null);
    setPokemon2AttackType(null);
    setPokemon1TakingDamage(false);
    setPokemon2TakingDamage(false);
    setEffectiveness(null);
    previousLogLengthRef.current = 0;
    currentTurnMoveTypesRef.current = { move1Type: null, move2Type: null };
  };

  // Reset effectiveness after display
  useEffect(() => {
    if (effectiveness !== null) {
      const timer = setTimeout(() => {
        setEffectiveness(null);
      }, 2000 / animationSpeed);
      return () => clearTimeout(timer);
    }
  }, [effectiveness, animationSpeed]);

  // Show selection UI if battle not started
  if (!battle || !battleState) {
    return (
      <PokemonSelection
        onPokemonSelected={handlePokemonSelected}
        isStarting={isLoading}
      />
    );
  }

  const pokemon1 = getActivePokemon(0);
  const pokemon2 = getActivePokemon(1);
  const finished = isBattleFinished();
  const winner = getWinner();

  return (
    <div className="space-y-6 relative">
      {/* Effectiveness Indicator - centered above battle */}
      {effectiveness !== null && effectiveness !== 1 && (
        <EffectivenessIndicator
          effectiveness={effectiveness}
          speedMultiplier={animationSpeed}
        />
      )}

      {/* Battle View */}
      <div className="grid gap-6 lg:grid-cols-3 relative">
        {/* Type Particles - rendered here for proper positioning */}
        {pokemon1Attacking && pokemon1AttackType && (
          <TypeParticles
            type={pokemon1AttackType}
            fromPosition="left"
            toPosition="right"
            containerWidth={typeof window !== "undefined" ? window.innerWidth * 0.9 : 1200}
            containerHeight={400}
            speedMultiplier={animationSpeed}
          />
        )}
        {pokemon2Attacking && pokemon2AttackType && (
          <TypeParticles
            type={pokemon2AttackType}
            fromPosition="right"
            toPosition="left"
            containerWidth={typeof window !== "undefined" ? window.innerWidth * 0.9 : 1200}
            containerHeight={400}
            speedMultiplier={animationSpeed}
          />
        )}
        {/* Left Pokemon */}
        <div className="lg:col-span-1">
          {pokemon1 && (
            <PokemonPanel
              activePokemon={pokemon1}
              spriteUrl={pokemon1Sprite}
              position="left"
              isAnimating={isAnimating}
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

        {/* Center: Move Selector & Controls */}
        <div className="lg:col-span-1 space-y-4">
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
                  // For now, opponent picks first move randomly
                  // TODO: Implement better AI or allow user to pick both
                  const opponentMoveIndex = Math.floor(
                    Math.random() * pokemon2Moves.length
                  );
                  executeTurn(moveIndex, opponentMoveIndex);
                }}
                disabled={isAnimating || finished}
              />
            )}

            {finished && (
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {winner !== null
                    ? `${winner === 0 ? pokemon1?.pokemon.name : pokemon2?.pokemon.name} wins!`
                    : "Battle finished"}
                </p>
              </div>
            )}
          </div>

          <BattleControls
            onReset={handleReset}
            onAutoPlay={handleAutoPlay}
            onPause={handlePause}
            onReplay={battleSeed !== null ? handleReplay : undefined}
            isAutoPlaying={isAutoPlaying}
            canReplay={battleSeed !== null && selectedPokemon1 !== null && selectedPokemon2 !== null}
            animationSpeed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
          />
        </div>

        {/* Right Pokemon */}
        <div className="lg:col-span-1">
          {pokemon2 && (
            <PokemonPanel
              activePokemon={pokemon2}
              spriteUrl={pokemon2Sprite}
              position="right"
              isAnimating={isAnimating}
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

      {/* Battle Log */}
      {battleState && (
        <BattleLog
          log={battleState.log}
          pokemon1Name={pokemon1?.pokemon.name ?? "Pokemon 1"}
          pokemon2Name={pokemon2?.pokemon.name ?? "Pokemon 2"}
        />
      )}
    </div>
  );
}

