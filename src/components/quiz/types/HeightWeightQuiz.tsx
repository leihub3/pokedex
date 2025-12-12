"use client";

import { useState, useEffect, useCallback } from "react";
import { getRandomPokemonBatch } from "@/lib/api/quizData";
import { formatPokemonName } from "@/lib/utils/quizHelpers";
import type { Pokemon } from "@/types/api";

interface HeightWeightQuizProps {
  onAnswer: (answer: string, isCorrect: boolean) => void;
  selectedAnswer: string | null;
  isLoading: boolean;
  round: number;
}

export function HeightWeightQuiz({
  onAnswer,
  selectedAnswer,
  isLoading,
  round,
}: HeightWeightQuizProps) {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [questionType, setQuestionType] = useState<"height" | "weight">("height");
  const [correctPokemon, setCorrectPokemon] = useState<Pokemon | null>(null);

  const loadQuestion = useCallback(async () => {
    try {
      const pokemon = await getRandomPokemonBatch(4);
      if (pokemon.length < 4) return;

      setPokemonList(pokemon);

      // Randomly choose height or weight
      const type = Math.random() > 0.5 ? "height" : "weight";
      setQuestionType(type);

      // Find Pokemon with highest height/weight
      const sorted = [...pokemon].sort((a, b) => {
        if (type === "height") {
          return b.height - a.height;
        } else {
          return b.weight - a.weight;
        }
      });
      setCorrectPokemon(sorted[0]);
    } catch (error) {
      console.error("Error loading height/weight question:", error);
    }
  }, []);

  useEffect(() => {
    loadQuestion();
  }, [round, loadQuestion]);

  if (isLoading || pokemonList.length === 0 || !correctPokemon) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading question...</div>
      </div>
    );
  }

  const questionText =
    questionType === "height"
      ? "Which Pokemon is the tallest?"
      : "Which Pokemon is the heaviest?";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{questionText}</p>
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
          const value = questionType === "height" ? pokemon.height : pokemon.weight;
          const unit = questionType === "height" ? "dm" : "hg";

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
                    {questionType === "height" ? "Height" : "Weight"}: {value} {unit}
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

