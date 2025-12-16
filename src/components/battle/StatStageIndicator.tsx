"use client";

import { motion } from "framer-motion";
import type { StatStages } from "@/battle-engine";

interface StatStageIndicatorProps {
  statStages: StatStages;
}

const STAT_NAMES: Array<keyof StatStages> = [
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "speed",
];

export function StatStageIndicator({ statStages }: StatStageIndicatorProps) {
  const activeStages = STAT_NAMES.filter((stat) => statStages[stat] !== 0);

  if (activeStages.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeStages.map((stat) => {
        const stage = statStages[stat];
        const isPositive = stage > 0;
        const arrows = isPositive ? "↑".repeat(stage) : "↓".repeat(-stage);

        return (
          <motion.div
            key={stat}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded px-2 py-1 text-xs font-semibold ${
              isPositive
                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            <span className="capitalize">{stat.replace(/([A-Z])/g, " $1").trim()}</span>
            <span className="ml-1">{arrows}</span>
          </motion.div>
        );
      })}
    </div>
  );
}



