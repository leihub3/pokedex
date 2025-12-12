"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuizStore } from "@/store/quizStore";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { QuizHistory } from "./QuizHistory";
import { QuizModeSelector } from "./QuizModeSelector";
import { QuizRenderer } from "./QuizRenderer";
import { useBaseQuiz } from "@/hooks/useBaseQuiz";
import { QuizType } from "@/types/quiz";

export function QuizGame() {
  const [selectedQuizType, setSelectedQuizType] = useState<QuizType | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { getStats, playerName: storedName, setPlayerName: setStoredName } = useQuizStore();

  // Load stored player name on mount
  useEffect(() => {
    if (storedName) {
      setPlayerName(storedName);
    }
  }, [storedName]);

  // Default to NAME quiz if no type selected
  const activeQuizType = selectedQuizType || QuizType.NAME;

  // Create a dummy question loader for useBaseQuiz
  // The actual loading is handled by individual quiz components
  const loadQuestion = useCallback(async () => {
    // This is a placeholder - actual loading happens in quiz components
    return Promise.resolve();
  }, []);

  const {
    score,
    round,
    timeLeft,
    isGameActive,
    selectedAnswer,
    isLoading: baseQuizLoading,
    startGame,
    handleAnswer,
    endGame,
  } = useBaseQuiz({
    quizType: activeQuizType,
    onQuestionLoad: loadQuestion,
    timeLimit: 30,
  });

  const handleNameSubmit = () => {
    if (playerName.trim()) {
      setStoredName(playerName.trim());
      setShowNameInput(false);
    }
  };

  const handleStartGame = () => {
    if (!selectedQuizType) {
      // If no quiz type selected, default to NAME
      setSelectedQuizType(QuizType.NAME);
    }
    startGame();
  };

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

        {/* Quiz Mode Selector */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
          <QuizModeSelector
            selectedType={selectedQuizType}
            onSelectType={setSelectedQuizType}
          />
        </div>

        <div className="text-center">
          <button
            onClick={handleStartGame}
            disabled={!playerName.trim() || !selectedQuizType}
            className="rounded-lg bg-blue-600 px-8 py-4 text-xl font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
          >
            Start Quiz
          </button>
          {!playerName.trim() && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please enter your name first
            </p>
          )}
          {!selectedQuizType && playerName.trim() && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please select a quiz mode
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
          <button
            onClick={endGame}
            className="mt-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
          >
            End Game
          </button>
        </div>
      </div>

      <QuizRenderer
        quizType={activeQuizType}
        onAnswer={handleAnswer}
        selectedAnswer={selectedAnswer}
        isLoading={baseQuizLoading}
        round={round}
      />
    </div>
  );
}
