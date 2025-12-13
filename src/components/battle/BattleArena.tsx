"use client";

import { useState, useEffect } from "react";
import { useBattle } from "@/hooks/useBattle";
import { PokemonSelection } from "./PokemonSelection";
import { PokemonPanel } from "./PokemonPanel";
import { MoveSelector } from "./MoveSelector";
import { BattleLog } from "./BattleLog";
import { BattleControls } from "./BattleControls";
import type { Pokemon as APIPokemon } from "@/types/api";

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

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || !battle || isBattleFinished()) {
      return;
    }

    const interval = setInterval(() => {
      if (!battle || isBattleFinished() || isAnimating) {
        setIsAutoPlaying(false);
        return;
      }

      // Random moves for both Pokemon
      const move1Index = Math.floor(Math.random() * pokemon1Moves.length);
      const move2Index = Math.floor(Math.random() * pokemon2Moves.length);
      executeTurn(move1Index, move2Index);
    }, 2500); // Wait 2.5 seconds between turns (allows animations to finish)

    return () => clearInterval(interval);
  }, [isAutoPlaying, battle, pokemon1Moves.length, pokemon2Moves.length, isBattleFinished, isAnimating, executeTurn]);

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
  };

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
    <div className="space-y-6">
      {/* Battle View */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Pokemon */}
        <div className="lg:col-span-1">
          {pokemon1 && (
            <PokemonPanel
              activePokemon={pokemon1}
              spriteUrl={pokemon1Sprite}
              position="left"
              isAnimating={isAnimating}
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

