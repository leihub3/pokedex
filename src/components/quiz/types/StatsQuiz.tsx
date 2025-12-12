"use client";

import { useState, useEffect, useCallback } from "react";
import { getRandomPokemonBatch } from "@/lib/api/quizData";
import { getPokemonStat, getStatName, formatPokemonName } from "@/lib/utils/quizHelpers";
import type { Pokemon } from "@/types/api";

interface StatsQuizProps {
  onAnswer: (answer: string, isCorrect: boolean) => void;
  selectedAnswer: string | null;
  isLoading: boolean;
  round: number;
}

const STAT_NAMES = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];

export function StatsQuiz({ onAnswer, selectedAnswer, isLoading, round }: StatsQuizProps) {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [correctPokemon, setCorrectPokemon] = useState<Pokemon | null>(null);

  const loadQuestion = useCallback(async () => {
    try {
      const pokemon = await getRandomPokemonBatch(4);
      if (pokemon.length < 4) return;

      setPokemonList(pokemon);

      // Select a random stat
      const stat = STAT_NAMES[Math.floor(Math.random() * STAT_NAMES.length)];
      setSelectedStat(stat);

      // Find Pokemon with highest stat
      const sortedByStat = [...pokemon].sort(
        (a, b) => getPokemonStat(b, stat) - getPokemonStat(a, stat)
      );
      setCorrectPokemon(sortedByStat[0]);
    } catch (error) {
      console.error("Error loading stats question:", error);
    }
  }, []);

  useEffect(() => {
    loadQuestion();
  }, [round, loadQuestion]);

  if (isLoading || pokemonList.length === 0 || !selectedStat || !correctPokemon) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Which Pokemon has the highest {getStatName(selectedStat)}?
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pokemonList.map((pokemon) => {
          const isSelected = selectedAnswer === pokemon.name;
          const isCorrect = pokemon.name === correctPokemon.name;
          const showResult = selectedAnswer !== null;
          const statValue = getPokemonStat(pokemon, selectedStat);
          const imageUrl =
            pokemon.sprites.other["official-artwork"].front_default ||
            pokemon.sprites.front_default ||
            "";

          return (
            <button
              key={pokemon.id}
              onClick={() => onAnswer(pokemon.name, isCorrect)}
              disabled={selectedAnswer !== null}
              className={`rounded-lg border-2 p-4 transition-all ${
                showResult && isCorrect
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : showResult && isSelected && !isCorrect
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-200 bg-white hover:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={pokemon.name}
                    className="h-16 w-16 object-contain"
                  />
                )}
                <div className="flex-1 text-left">
                  <p className="font-semibold capitalize text-gray-900 dark:text-gray-100">
                    {formatPokemonName(pokemon.name)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getStatName(selectedStat)}: {statValue}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

