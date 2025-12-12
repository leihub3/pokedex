"use client";

import { useState, useEffect, useCallback } from "react";
import { getRandomMoves } from "@/lib/api/quizData";
import type { Move } from "@/types/api";

interface MovePowerQuizProps {
  onAnswer: (answer: string, isCorrect: boolean) => void;
  selectedAnswer: string | null;
  isLoading: boolean;
  round: number;
}

export function MovePowerQuiz({ onAnswer, selectedAnswer, isLoading, round }: MovePowerQuizProps) {
  const [moves, setMoves] = useState<Move[]>([]);
  const [correctMove, setCorrectMove] = useState<Move | null>(null);

  const loadQuestion = useCallback(async () => {
    try {
      const moveList = await getRandomMoves(4);
      if (moveList.length < 4) {
        // Retry if not enough moves with power
        loadQuestion();
        return;
      }

      setMoves(moveList);

      // Find move with highest power
      const sorted = [...moveList].sort((a, b) => (b.power || 0) - (a.power || 0));
      setCorrectMove(sorted[0]);
    } catch (error) {
      console.error("Error loading move power question:", error);
    }
  }, []);

  useEffect(() => {
    loadQuestion();
  }, [round, loadQuestion]);

  if (isLoading || moves.length === 0 || !correctMove) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading question...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Which move has the highest power?
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {moves.map((move) => {
          const isSelected = selectedAnswer === move.name;
          const isCorrect = move.name === correctMove.name;
          const showResult = selectedAnswer !== null;
          const moveName = move.name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          const power = move.power || 0;

          return (
            <button
              key={move.id}
              onClick={() => onAnswer(move.name, isCorrect)}
              disabled={selectedAnswer !== null}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                showResult && isCorrect
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : showResult && isSelected && !isCorrect
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-200 bg-white hover:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{moveName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Type: {move.type.name.charAt(0).toUpperCase() + move.type.name.slice(1)}
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Power: {power}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

