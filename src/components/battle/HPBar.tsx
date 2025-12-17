"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface HPBarProps {
  currentHP: number;
  maxHP: number;
  pokemonName: string;
  previousHP?: number; // For calculating damage amount
  isKO?: boolean; // For KO animation
}

export function HPBar({ currentHP, maxHP, pokemonName, previousHP, isKO = false }: HPBarProps) {
  const percentage = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
  const isCritical = percentage < 25;
  const previousPercentage = previousHP !== undefined ? Math.max(0, Math.min(100, (previousHP / maxHP) * 100)) : percentage;
  
  // Calculate damage amount
  const damage = previousHP !== undefined && previousHP > currentHP ? previousHP - currentHP : 0;
  const hpChange = Math.abs(previousPercentage - percentage);
  
  // Animation duration: 800ms for large changes, 400ms for small
  const animationDuration = hpChange > 20 ? 0.8 : 0.4;

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
            duration: animationDuration,
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
        {isKO && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
          >
            <span className="text-xs font-bold text-white">KO</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}



