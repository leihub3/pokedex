"use client";

import { motion } from "framer-motion";
import { QuizType, QUIZ_TYPE_METADATA } from "@/types/quiz";

interface QuizModeSelectorProps {
  selectedType: QuizType | null;
  onSelectType: (type: QuizType) => void;
}

export function QuizModeSelector({ selectedType, onSelectType }: QuizModeSelectorProps) {
  const quizTypes = Object.values(QuizType);
  const difficultyColors = {
    easy: "from-green-500 to-emerald-500",
    medium: "from-yellow-500 to-orange-500",
    hard: "from-red-500 to-pink-500",
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Select Quiz Mode
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quizTypes.map((type, index) => {
          const metadata = QUIZ_TYPE_METADATA[type];
          const isSelected = selectedType === type;

          return (
            <motion.button
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectType(type)}
              className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                  : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-lg bg-gradient-to-br ${difficultyColors[metadata.difficulty]} p-2 text-2xl`}
                >
                  {metadata.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {metadata.name}
                    </h4>
                    {isSelected && (
                      <span className="text-blue-600 dark:text-blue-400">✓</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {metadata.description}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      metadata.difficulty === "easy"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : metadata.difficulty === "medium"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {metadata.difficulty}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

