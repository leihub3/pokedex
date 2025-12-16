"use client";

import { motion } from "framer-motion";

interface HPBarProps {
  currentHP: number;
  maxHP: number;
  pokemonName: string;
}

export function HPBar({ currentHP, maxHP, pokemonName }: HPBarProps) {
  const percentage = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
  const isCritical = percentage < 25;

  // Color based on HP percentage
  let barColor = "bg-green-500";
  if (percentage <= 30) {
    barColor = "bg-red-500";
  } else if (percentage <= 60) {
    barColor = "bg-yellow-500";
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          HP
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {currentHP} / {maxHP}
        </span>
      </div>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <motion.div
          initial={false}
          animate={{
            width: `${percentage}%`,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className={`h-full ${barColor} ${isCritical ? "animate-pulse" : ""}`}
        />
        {isCritical && (
          <motion.div
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-red-600 opacity-50"
          />
        )}
      </div>
    </div>
  );
}



