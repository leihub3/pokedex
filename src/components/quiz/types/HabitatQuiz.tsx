"use client";

import { useState, useEffect, useCallback } from "react";
import { getPokemonByType, getPokemonHabitat } from "@/lib/api/quizData";
import { generateWrongPokemonNames, formatPokemonName } from "@/lib/utils/quizHelpers";
import { getPokemonById, getAllPokemonList } from "@/lib/api/pokemon";
import type { Pokemon } from "@/types/api";

interface HabitatQuizProps {
  onAnswer: (answer: string, isCorrect: boolean) => void;
  selectedAnswer: string | null;
  isLoading: boolean;
  round: number;
}

export function HabitatQuiz({ onAnswer, selectedAnswer, isLoading, round }: HabitatQuizProps) {
  const [currentHabitat, setCurrentHabitat] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);

  const loadQuestion = useCallback(async () => {
    try {
      // Get all Pokemon and find one with a habitat
      const allPokemon = await getAllPokemonList();
      let pokemonWithHabitat: Pokemon | null = null;
      let habitat: string | null = null;

      // Try a few random Pokemon to find one with habitat
      for (let i = 0; i < 20; i++) {
        const randomIndex = Math.floor(Math.random() * allPokemon.results.length);
        const randomPokemon = allPokemon.results[randomIndex];
        const match = randomPokemon.url.match(/\/pokemon\/(\d+)\//);
        if (!match) continue;

        const pokemonId = parseInt(match[1], 10);
        const pokemonHabitat = await getPokemonHabitat(pokemonId);
        if (pokemonHabitat) {
          habitat = pokemonHabitat;
          pokemonWithHabitat = await getPokemonById(pokemonId);
          break;
        }
      }

      if (!habitat || !pokemonWithHabitat) {
        // Retry if no habitat found
        loadQuestion();
        return;
      }

      setCurrentHabitat(habitat);
      setCorrectAnswer(pokemonWithHabitat.name);

      const wrongAnswers = await generateWrongPokemonNames(pokemonWithHabitat.name, 3);
      const allOptions = [pokemonWithHabitat.name, ...wrongAnswers];
      setOptions(allOptions.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error("Error loading habitat question:", error);
    }
  }, []);

  useEffect(() => {
    loadQuestion();
  }, [round, loadQuestion]);

  if (isLoading || !currentHabitat || !correctAnswer) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading question...</div>
      </div>
    );
  }

  const habitatName = currentHabitat.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Which Pokemon lives in the <span className="text-blue-600 dark:text-blue-400">"{habitatName}"</span> habitat?
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

