"use client";

import { useState, useEffect, useCallback } from "react";
import { getRandomPokemon, getPokemonNextEvolution, generateWrongPokemonNames } from "@/lib/api/quizData";
import { formatPokemonName } from "@/lib/utils/quizHelpers";
import type { Pokemon } from "@/types/api";

interface EvolutionQuizProps {
  onAnswer: (answer: string, isCorrect: boolean) => void;
  selectedAnswer: string | null;
  isLoading: boolean;
  round: number;
}

export function EvolutionQuiz({ onAnswer, selectedAnswer, isLoading, round }: EvolutionQuizProps) {
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);

  const loadQuestion = useCallback(async () => {
    try {
      const pokemon = await getRandomPokemon();
      if (!pokemon) return;

      setCurrentPokemon(pokemon);

      const evolutions = await getPokemonNextEvolution(pokemon.id);
      if (!evolutions || evolutions.length === 0) {
        // This Pokemon doesn't evolve, retry
        loadQuestion();
        return;
      }

      // Pick first evolution (or random if multiple)
      const evolution = evolutions[Math.floor(Math.random() * evolutions.length)];
      setCorrectAnswer(evolution);

      const wrongAnswers = await generateWrongPokemonNames(evolution, 3);
      const allOptions = [evolution, ...wrongAnswers];
      setOptions(allOptions.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error("Error loading evolution question:", error);
    }
  }, []);

  useEffect(() => {
    loadQuestion();
  }, [round, loadQuestion]);

  if (isLoading || !currentPokemon || !correctAnswer) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading question...</div>
      </div>
    );
  }

  const imageUrl =
    currentPokemon.sprites.other["official-artwork"].front_default ||
    currentPokemon.sprites.front_default ||
    "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={currentPokemon.name}
            className="h-32 w-32 object-contain"
          />
        )}
        <p className="text-xl font-semibold capitalize text-gray-900 dark:text-gray-100">
          {formatPokemonName(currentPokemon.name)}
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          What does this Pokemon evolve into?
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === correctAnswer;
          const showResult = selectedAnswer !== null;

          return (
            <button
              key={option}
              onClick={() => onAnswer(option, isCorrect)}
              disabled={selectedAnswer !== null}
              className={`rounded-lg border-2 p-4 text-left font-semibold capitalize transition-all ${
                showResult && isCorrect
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : showResult && isSelected && !isCorrect
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-200 bg-white hover:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              {formatPokemonName(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

