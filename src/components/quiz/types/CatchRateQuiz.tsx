"use client";

import { useState, useEffect, useCallback } from "react";
import { getRandomPokemonBatch, getPokemonCaptureRate } from "@/lib/api/quizData";
import { formatPokemonName } from "@/lib/utils/quizHelpers";
import type { Pokemon } from "@/types/api";

interface CatchRateQuizProps {
  onAnswer: (answer: string, isCorrect: boolean) => void;
  selectedAnswer: string | null;
  isLoading: boolean;
  round: number;
}

export function CatchRateQuiz({ onAnswer, selectedAnswer, isLoading, round }: CatchRateQuizProps) {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [pokemonRates, setPokemonRates] = useState<Map<number, number>>(new Map());
  const [correctPokemon, setCorrectPokemon] = useState<Pokemon | null>(null);

  const loadQuestion = useCallback(async () => {
    try {
      const pokemon = await getRandomPokemonBatch(4);
      if (pokemon.length < 4) return;

      setPokemonList(pokemon);

      // Get capture rates for all Pokemon
      const rates = new Map<number, number>();
      for (const p of pokemon) {
        const rate = await getPokemonCaptureRate(p.id, p.name, p);
        if (rate !== null) {
          rates.set(p.id, rate);
        }
      }

      if (rates.size < 4) {
        // Retry if not all rates found
        loadQuestion();
        return;
      }

      setPokemonRates(rates);

      // Find Pokemon with lowest capture rate (hardest to catch)
      const sorted = [...pokemon].sort((a, b) => {
        const rateA = rates.get(a.id) || 255;
        const rateB = rates.get(b.id) || 255;
        return rateA - rateB; // Lower rate = harder to catch
      });
      setCorrectPokemon(sorted[0]);
    } catch (error) {
      console.error("Error loading catch rate question:", error);
    }
  }, []);

  useEffect(() => {
    loadQuestion();
  }, [round, loadQuestion]);

  if (isLoading || pokemonList.length === 0 || !correctPokemon || pokemonRates.size === 0) {
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
          Which Pokemon has the lowest capture rate? (Hardest to catch)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {pokemonList.map((pokemon) => {
          const isSelected = selectedAnswer === pokemon.name;
          const isCorrect = pokemon.name === correctPokemon.name;
          const showResult = selectedAnswer !== null;
          const imageUrl =
            pokemon.sprites.other["official-artwork"].front_default ||
            pokemon.sprites.front_default ||
            "";
          const captureRate = pokemonRates.get(pokemon.id) || 0;

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
                    Capture Rate: {captureRate}
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

