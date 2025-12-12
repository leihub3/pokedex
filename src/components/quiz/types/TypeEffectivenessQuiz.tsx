"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchTypeEffectivenessData, getRandomType, getAllTypes } from "@/lib/api/quizData";
import { generateWrongTypes, formatTypeName } from "@/lib/utils/quizHelpers";
import type { PokemonTypeResponse } from "@/types/api";

interface TypeEffectivenessQuizProps {
  onAnswer: (answer: string, isCorrect: boolean) => void;
  selectedAnswer: string | null;
  isLoading: boolean;
  round: number;
}

export function TypeEffectivenessQuiz({
  onAnswer,
  selectedAnswer,
  isLoading,
  round,
}: TypeEffectivenessQuizProps) {
  const [currentType, setCurrentType] = useState<string | null>(null);
  const [typeData, setTypeData] = useState<PokemonTypeResponse | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<"super-effective" | "not-effective" | "no-effect">("super-effective");

  const loadQuestion = useCallback(async () => {
    try {
      const randomType = await getRandomType();
      if (!randomType) return;

      const type = await fetchTypeEffectivenessData(randomType);
      if (!type) return;

      setCurrentType(randomType);
      setTypeData(type);

      // Randomly choose question type
      const questionTypes: Array<"super-effective" | "not-effective" | "no-effect"> = [
        "super-effective",
        "not-effective",
        "no-effect",
      ];
      const selectedQuestionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      setQuestionType(selectedQuestionType);

      // Get correct answer based on question type
      let correctType: string;
      if (selectedQuestionType === "super-effective") {
        const superEffectiveTypes = type.damage_relations.double_damage_from;
        if (superEffectiveTypes.length === 0) {
          // If no super effective types, use half damage instead
          const halfDamageTypes = type.damage_relations.half_damage_from;
          if (halfDamageTypes.length > 0) {
            correctType = halfDamageTypes[Math.floor(Math.random() * halfDamageTypes.length)].name;
            setQuestionType("not-effective");
          } else {
            // Fallback to any type
            const allTypes = await getAllTypes();
            correctType = allTypes[Math.floor(Math.random() * allTypes.length)];
          }
        } else {
          correctType = superEffectiveTypes[Math.floor(Math.random() * superEffectiveTypes.length)].name;
        }
      } else if (selectedQuestionType === "not-effective") {
        const notVeryEffectiveTypes = type.damage_relations.half_damage_from;
        if (notVeryEffectiveTypes.length === 0) {
          const superEffectiveTypes = type.damage_relations.double_damage_from;
          if (superEffectiveTypes.length > 0) {
            correctType = superEffectiveTypes[Math.floor(Math.random() * superEffectiveTypes.length)].name;
            setQuestionType("super-effective");
          } else {
            const allTypes = await getAllTypes();
            correctType = allTypes[Math.floor(Math.random() * allTypes.length)];
          }
        } else {
          correctType = notVeryEffectiveTypes[Math.floor(Math.random() * notVeryEffectiveTypes.length)].name;
        }
      } else {
        // no-effect
        const noEffectTypes = type.damage_relations.no_damage_from;
        if (noEffectTypes.length === 0) {
          // Fallback to super effective
          const superEffectiveTypes = type.damage_relations.double_damage_from;
          if (superEffectiveTypes.length > 0) {
            correctType = superEffectiveTypes[Math.floor(Math.random() * superEffectiveTypes.length)].name;
            setQuestionType("super-effective");
          } else {
            const allTypes = await getAllTypes();
            correctType = allTypes[Math.floor(Math.random() * allTypes.length)];
          }
        } else {
          correctType = noEffectTypes[Math.floor(Math.random() * noEffectTypes.length)].name;
        }
      }

      setCorrectAnswer(correctType);
      const wrongAnswers = await generateWrongTypes(correctType, 3);
      const allOptions = [correctType, ...wrongAnswers];
      setOptions(allOptions.sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error("Error loading type effectiveness question:", error);
    }
  }, []);

  useEffect(() => {
    loadQuestion();
  }, [round, loadQuestion]);

  if (isLoading || !currentType || !correctAnswer) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading question...</div>
      </div>
    );
  }

  const questionText =
    questionType === "super-effective"
      ? `What type is super effective against ${formatTypeName(currentType)}?`
      : questionType === "not-effective"
      ? `What type is not very effective against ${formatTypeName(currentType)}?`
      : `What type has no effect on ${formatTypeName(currentType)}?`;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{questionText}</p>
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

