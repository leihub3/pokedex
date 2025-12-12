"use client";

import { useState, useEffect, useCallback } from "react";
import { getRandomPokemonWithFlavorText } from "@/lib/api/quizData";
import { formatPokemonName, truncateFlavorText, generateWrongPokemonNames } from "@/lib/utils/quizHelpers";
import type { Pokemon } from "@/types/api";

interface PokedexQuizProps {
  onAnswer: (answer: string, isCorrect: boolean) => void;
  selectedAnswer: string | null;
  isLoading: boolean;
  round: number;
}

export function PokedexQuiz({ onAnswer, selectedAnswer, isLoading, round }: PokedexQuizProps) {
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null);
  const [flavorText, setFlavorText] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);

  const loadQuestion = useCallback(async () => {
    try {
      const data = await getRandomPokemonWithFlavorText();
      if (!data) {
        // Retry if no flavor text found
        loadQuestion();
        return;
      }

      setCurrentPokemon(data.pokemon);
      setFlavorText(truncateFlavorText(data.flavorText));
      setCorrectAnswer(data.pokemon.name);

      const wrongAnswers = await generateWrongPokemonNames(data.pokemon.name, 3);
      const allOptions = [data.pokemon.name, ...wrongAnswers];
      setOptions(allOptions.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error("Error loading Pokedex question:", error);
    }
  }, []);

  useEffect(() => {
    loadQuestion();
  }, [round, loadQuestion]);

  if (isLoading || !currentPokemon || !correctAnswer || !flavorText) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Which Pokemon is described as:
          </p>
          <p className="text-lg italic text-gray-700 dark:text-gray-300">
            "{flavorText}"
          </p>
        </div>
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

