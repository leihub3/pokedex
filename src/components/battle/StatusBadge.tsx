"use client";

import { motion } from "framer-motion";
import type { StatusCondition } from "@/battle-engine";

interface StatusBadgeProps {
  status: StatusCondition | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return null;

  const statusConfig = {
    burn: {
      icon: "🔥",
      label: "Burned",
      className: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400",
    },
    poison: {
      icon: "💜",
      label: "Poisoned",
      className: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-400",
    },
    paralysis: {
      icon: "⚡",
      label: "Paralyzed",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400",
    },
    sleep: {
      icon: "😴",
      label: `Sleeping${status.type === "sleep" ? ` (${status.turnsRemaining})` : ""}`,
      className: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-400",
    },
  };

  const config = statusConfig[status.type];

  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${config.className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </motion.div>
  );
}

