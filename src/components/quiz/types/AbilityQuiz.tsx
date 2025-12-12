"use client";

import { useState, useEffect, useCallback } from "react";
import { getRandomAbility, getPokemonWithAbility } from "@/lib/api/quizData";
import { generateWrongPokemonNames, formatPokemonName } from "@/lib/utils/quizHelpers";
import type { Ability } from "@/types/api";

interface AbilityQuizProps {
  onAnswer: (answer: string, isCorrect: boolean) => void;
  selectedAnswer: string | null;
  isLoading: boolean;
  round: number;
}

export function AbilityQuiz({ onAnswer, selectedAnswer, isLoading, round }: AbilityQuizProps) {
  const [currentAbility, setCurrentAbility] = useState<Ability | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);

  const loadQuestion = useCallback(async () => {
    try {
      const ability = await getRandomAbility();
      if (!ability) return;

      // Get Pokemon that have this ability
      const pokemonWithAbility = await getPokemonWithAbility(ability.name);
      if (pokemonWithAbility.length === 0) {
        // Retry if no Pokemon found
        loadQuestion();
        return;
      }

      setCurrentAbility(ability);

      // Pick a random Pokemon that has this ability
      const randomPokemon = pokemonWithAbility[Math.floor(Math.random() * pokemonWithAbility.length)];
      const match = randomPokemon.url.match(/\/pokemon\/(\d+)\//);
      if (!match) {
        loadQuestion();
        return;
      }

      const correctPokemonName = randomPokemon.name;
      setCorrectAnswer(correctPokemonName);

      const wrongAnswers = await generateWrongPokemonNames(correctPokemonName, 3);
      const allOptions = [correctPokemonName, ...wrongAnswers];
      setOptions(allOptions.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error("Error loading ability question:", error);
    }
  }, []);

  useEffect(() => {
    loadQuestion();
  }, [round, loadQuestion]);

  if (isLoading || !currentAbility || !correctAnswer) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading question...</div>
      </div>
    );
  }

  const abilityName = currentAbility.name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Which Pokemon has the ability <span className="text-blue-600 dark:text-blue-400">"{abilityName}"</span>?
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

