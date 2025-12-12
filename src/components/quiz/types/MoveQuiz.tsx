"use client";

import { useState, useEffect, useCallback } from "react";
import { getRandomMove, getAllTypes } from "@/lib/api/quizData";
import { generateWrongTypes, formatTypeName } from "@/lib/utils/quizHelpers";
import type { Move } from "@/types/api";

interface MoveQuizProps {
  onAnswer: (answer: string, isCorrect: boolean) => void;
  selectedAnswer: string | null;
  isLoading: boolean;
  round: number;
}

export function MoveQuiz({ onAnswer, selectedAnswer, isLoading, round }: MoveQuizProps) {
  const [currentMove, setCurrentMove] = useState<Move | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);

  const loadQuestion = useCallback(async () => {
    try {
      const move = await getRandomMove();
      if (!move || !move.type) return;

      setCurrentMove(move);
      setCorrectAnswer(move.type.name);

      const wrongAnswers = await generateWrongTypes(move.type.name, 3);
      const allOptions = [move.type.name, ...wrongAnswers];
      setOptions(allOptions.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error("Error loading move question:", error);
    }
  }, []);

  useEffect(() => {
    loadQuestion();
  }, [round, loadQuestion]);

  if (isLoading || !currentMove || !correctAnswer) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading question...</div>
      </div>
    );
  }

  const moveName = currentMove.name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          What type is the move <span className="text-blue-600 dark:text-blue-400">"{moveName}"</span>?
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
              {formatTypeName(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

