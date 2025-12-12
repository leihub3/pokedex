"use client";

import { useState, useEffect, useCallback } from "react";
import { useBaseQuiz } from "@/hooks/useBaseQuiz";
import { QuizType } from "@/types/quiz";
import { getAllPokemonList } from "@/lib/api/pokemon";
import { getPokemonById } from "@/lib/api/pokemon";
import { generateWrongPokemonNames, formatPokemonName } from "@/lib/utils/quizHelpers";
import type { Pokemon } from "@/types/api";

interface NameQuizProps {
  onAnswer: (answer: string, isCorrect: boolean) => void;
  selectedAnswer: string | null;
  isLoading: boolean;
  round: number;
}

export function NameQuiz({ onAnswer, selectedAnswer, isLoading, round }: NameQuizProps) {
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [allPokemon, setAllPokemon] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    const loadPokemon = async () => {
      try {
        const response = await getAllPokemonList();
        setAllPokemon(response.results);
      } catch (error) {
        console.error("Error loading pokemon:", error);
      }
    };
    loadPokemon();
  }, []);

  const loadQuestion = useCallback(async () => {
    if (allPokemon.length === 0) return;

    try {
      const randomIndex = Math.floor(Math.random() * allPokemon.length);
      const randomPokemon = allPokemon[randomIndex];
      const match = randomPokemon.url.match(/\/pokemon\/(\d+)\//);
      if (!match) return;

      const pokemon = await getPokemonById(parseInt(match[1], 10));
      setCurrentPokemon(pokemon);

      const wrongAnswers = await generateWrongPokemonNames(pokemon.name, 3);
      const allOptions = [pokemon.name, ...wrongAnswers];
      setOptions(allOptions.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error("Error loading question:", error);
    }
  }, [allPokemon]);

  useEffect(() => {
    if (allPokemon.length > 0) {
      loadQuestion();
    }
  }, [allPokemon.length, round, loadQuestion]);

  if (isLoading || !currentPokemon) {
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
      <div className="flex justify-center">
        <div className="relative h-64 w-64">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Pokémon silhouette"
              className="h-full w-full object-contain brightness-0"
              style={{ filter: "brightness(0) contrast(0)" }}
            />
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentPokemon.name;
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

