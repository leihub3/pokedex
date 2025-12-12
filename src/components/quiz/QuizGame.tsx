"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAllPokemonList } from "@/lib/api/pokemon";
import { getPokemonById } from "@/lib/api/pokemon";
import { useQuizStore } from "@/store/quizStore";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { QuizHistory } from "./QuizHistory";
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
  const [showHistory, setShowHistory] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const { addScore, getStats, playerName: storedName, setPlayerName: setStoredName } = useQuizStore();

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
    
    // Load stored player name if available
    if (storedName) {
      setPlayerName(storedName);
    }
  }, [storedName]);

  const handleNameSubmit = () => {
    if (playerName.trim()) {
      setStoredName(playerName.trim());
      setShowNameInput(false);
    }
  };

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
      const totalQuestions = round + 1;
      const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
      addScore({
        score,
        total: totalQuestions,
        time: 30,
        date: new Date().toISOString(),
        accuracy,
        playerName: playerName || storedName || undefined,
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
    const totalQuestions = round + 1;
    const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    addScore({
      score,
      total: totalQuestions,
      time: 30 - timeLeft,
      date: new Date().toISOString(),
      accuracy,
      playerName: playerName || storedName || undefined,
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
    const stats = getStats();
    return (
      <div className="space-y-6">
        {/* Player Name Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Player Name
            </h3>
            {playerName && !showNameInput && (
              <button
                onClick={() => setShowNameInput(true)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Change
              </button>
            )}
          </div>
          
          {showNameInput || !playerName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNameSubmit();
                  }
                }}
                placeholder="Enter your name..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleNameSubmit}
                disabled={!playerName.trim()}
                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Save
              </button>
              {playerName && (
                <button
                  onClick={() => {
                    setShowNameInput(false);
                    setPlayerName(storedName || "");
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                👤 {playerName}
              </span>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={startGame}
            disabled={!playerName.trim()}
            className="rounded-lg bg-blue-600 px-8 py-4 text-xl font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            Start Quiz
          </button>
          {!playerName.trim() && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please enter your name first
            </p>
          )}
        </div>
        
        {/* Quick Stats */}
        {stats.totalGames > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center justify-center gap-6 text-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Best Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.bestScore}
                </p>
              </div>
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-700"></div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Games</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalGames}
                </p>
              </div>
              <div className="h-12 w-px bg-gray-300 dark:bg-gray-700"></div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.currentStreak} 🔥
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* History Toggle Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {showHistory ? '👆 Hide History' : '👇 View History & Stats'}
          </button>
        </div>
        
        {/* History Component */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <QuizHistory />
          </motion.div>
        )}
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

