"use client";

import { useState, useEffect, useCallback } from "react";
import { getRandomPokemonBatch, getPokemonLegendaryStatus } from "@/lib/api/quizData";
import { formatPokemonName } from "@/lib/utils/quizHelpers";
import type { Pokemon } from "@/types/api";

interface LegendaryQuizProps {
  onAnswer: (answer: string, isCorrect: boolean) => void;
  selectedAnswer: string | null;
  isLoading: boolean;
  round: number;
}

export function LegendaryQuiz({ onAnswer, selectedAnswer, isLoading, round }: LegendaryQuizProps) {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [correctPokemon, setCorrectPokemon] = useState<Pokemon | null>(null);
  const [questionType, setQuestionType] = useState<"legendary" | "mythical">("legendary");

  const loadQuestion = useCallback(async () => {
    try {
      // Get a larger batch to ensure we have legendary/mythical Pokemon
      const allPokemon = await getRandomPokemonBatch(20);
      if (allPokemon.length === 0) return;

      // Find legendary or mythical Pokemon
      let legendaryPokemon: Pokemon[] = [];
      let mythicalPokemon: Pokemon[] = [];

      for (const pokemon of allPokemon) {
        const status = await getPokemonLegendaryStatus(pokemon.id, pokemon.name, pokemon);
        if (status) {
          if (status.isLegendary) legendaryPokemon.push(pokemon);
          if (status.isMythical) mythicalPokemon.push(pokemon);
        }
      }
      
      // If we didn't find any legendary/mythical after checking all, try again with a fresh batch
      if (legendaryPokemon.length === 0 && mythicalPokemon.length === 0) {
        loadQuestion();
        return;
      }

      // Choose question type and correct answer
      let correct: Pokemon;
      let wrongPokemon: Pokemon[];
      let type: "legendary" | "mythical";

      if (legendaryPokemon.length > 0 && Math.random() > 0.5) {
        correct = legendaryPokemon[Math.floor(Math.random() * legendaryPokemon.length)];
        type = "legendary";
        wrongPokemon = allPokemon.filter(
          (p) => !legendaryPokemon.includes(p) && p.id !== correct.id
        );
      } else if (mythicalPokemon.length > 0) {
        correct = mythicalPokemon[Math.floor(Math.random() * mythicalPokemon.length)];
        type = "mythical";
        wrongPokemon = allPokemon.filter(
          (p) => !mythicalPokemon.includes(p) && p.id !== correct.id
        );
      } else {
        // Fallback: try again
        loadQuestion();
        return;
      }

      setCorrectPokemon(correct);
      setQuestionType(type);

      // Select 3 wrong answers
      const wrongAnswers = wrongPokemon
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const selectedPokemon = [correct, ...wrongAnswers];
      setPokemonList(selectedPokemon);
    } catch (error) {
      console.error("Error loading legendary question:", error);
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
    questionType === "legendary"
      ? "Which of these is a Legendary Pokemon?"
      : "Which of these is a Mythical Pokemon?";

  // Rebuild options from pokemonList
  const options = pokemonList.map((p) => p.name);

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
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

