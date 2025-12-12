"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAllPokemonList } from "@/lib/api/pokemon";
import { getPokemonById } from "@/lib/api/pokemon";
import { useQuizStore } from "@/store/quizStore";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import type { PokemonListItem, Pokemon } from "@/types/api";

export function QuizGame() {
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [currentPokemon, setCurrentPokemon] = useState<Pokemon | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameActive, setIsGameActive] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addScore } = useQuizStore();

  useEffect(() => {
    const loadPokemon = async () => {
      try {
        const response = await getAllPokemonList();
        setAllPokemon(response.results);
      } catch (error) {
        console.error("Error loading pokemon:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPokemon();
  }, []);

  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    setRound(0);
    setTimeLeft(30);
    loadNewQuestion();
  };

  const loadNewQuestion = async () => {
    if (allPokemon.length === 0) return;

    const randomIndex = Math.floor(Math.random() * allPokemon.length);
    const randomPokemon = allPokemon[randomIndex];
    const match = randomPokemon.url.match(/\/pokemon\/(\d+)\//);
    if (!match) return;

    try {
      const pokemon = await getPokemonById(parseInt(match[1], 10));
      setCurrentPokemon(pokemon);

      // Generate wrong answers
      const wrongAnswers: string[] = [];
      while (wrongAnswers.length < 3) {
        const wrongIndex = Math.floor(Math.random() * allPokemon.length);
        const wrongName = allPokemon[wrongIndex].name;
        if (wrongName !== pokemon.name && !wrongAnswers.includes(wrongName)) {
          wrongAnswers.push(wrongName);
        }
      }

      const allOptions = [pokemon.name, ...wrongAnswers].sort(
        () => Math.random() - 0.5
      );
      setOptions(allOptions);
      setSelectedAnswer(null);
    } catch (error) {
      console.error("Error loading pokemon:", error);
    }
  };

  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive]);

  // Handle game end when time runs out
  useEffect(() => {
    if (isGameActive && timeLeft === 0) {
      setIsGameActive(false);
      addScore({
        score,
        total: round + 1,
        time: 30,
        date: new Date().toISOString(),
      });
    }
  }, [timeLeft, isGameActive, score, round, addScore]);

  const handleAnswer = (answer: string) => {
    if (!currentPokemon || selectedAnswer) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === currentPokemon.name;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      setRound((prev) => prev + 1);
      loadNewQuestion();
    }, 1500);
  };

  const endGame = () => {
    setIsGameActive(false);
    addScore({
      score,
      total: round + 1,
      time: 30 - timeLeft,
      date: new Date().toISOString(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoaderSpinner size="lg" />
      </div>
    );
  }

  if (!isGameActive) {
    return (
      <div className="text-center">
        <button
          onClick={startGame}
          className="rounded-lg bg-blue-600 px-8 py-4 text-xl font-semibold text-white hover:bg-blue-700"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  const imageUrl =
    currentPokemon?.sprites.other["official-artwork"].front_default ||
    currentPokemon?.sprites.front_default ||
    "";

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Score: {score}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Round: {round + 1}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Time: {timeLeft}s
          </p>
        </div>
      </div>

      {currentPokemon && (
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
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={`rounded-lg border-2 p-4 text-left font-semibold capitalize transition-all ${
                    showResult && isCorrect
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : showResult && isSelected && !isCorrect
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 bg-white hover:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
                  }`}
                >
                  {option.replace(/-/g, " ")}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

