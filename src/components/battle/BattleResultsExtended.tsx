"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { BattleStats } from "@/hooks/useBattleStats";
import {
  type BattleSummaryInput,
  type CompactBattleSnapshot,
  type BattleAnalysisResult,
  analyzeBattle,
  createSnapshot,
} from "@/lib/utils/battleAnalysis";

interface BattleResultsExtendedProps {
  stats: BattleStats;
  /** Winner index from the battle engine, relative to pokemon0/pokemon1 */
  winnerIndex: 0 | 1 | null;
  /** Player index (defaults to 0, which is how we use stats today) */
  playerIndex?: 0 | 1;
  /**
   * Storage key for comparing against previous battles.
   * Use different keys for different modes (e.g., "elite-four", "battle").
   */
  storageKey?: string;
}

export function BattleResultsExtended({
  stats,
  winnerIndex,
  playerIndex = 0,
  storageKey = "default",
}: BattleResultsExtendedProps) {
  const [analysis, setAnalysis] = useState<BattleAnalysisResult | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const input: BattleSummaryInput = {
      stats,
      playerIndex,
      winnerIndex,
    };

    const key = `battle:summary:${storageKey}`;
    let previousSnapshot: CompactBattleSnapshot | null = null;

    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        previousSnapshot = JSON.parse(raw) as CompactBattleSnapshot;
      }
    } catch {
      // Ignore parse errors and treat as no previous summary
    }

    const result = analyzeBattle(input, previousSnapshot);
    setAnalysis(result);

    // Persist snapshot for next time
    try {
      const snapshot = createSnapshot(input);
      window.localStorage.setItem(key, JSON.stringify(snapshot));
    } catch {
      // Ignore storage errors (e.g., disabled cookies)
    }
  }, [stats, playerIndex, winnerIndex, storageKey]);

  if (!isClient || !analysis) {
    return null;
  }

  const {
    primaryMessage,
    secondaryMessages,
    achievements,
    ratingStars,
    ratingScore,
    comparisonMessages,
  } = analysis;

  const starsArray = Array.from({ length: 5 }, (_, i) => i < ratingStars);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Performance Overview
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Personalized notes based on your last battle.
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-lg">
            {starsArray.map((filled, idx) => (
              <span
                key={idx}
                className={
                  filled
                    ? "text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
                    : "text-slate-400"
                }
              >
                ★
              </span>
            ))}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Rating: {ratingScore}/100
          </p>
        </div>
      </div>

      <div className="mb-3 rounded-md bg-white/70 p-3 text-sm text-slate-900 dark:bg-slate-800/80 dark:text-slate-100">
        <p className="font-semibold">{primaryMessage}</p>
        {secondaryMessages.length > 0 && (
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-600 dark:text-slate-300">
            {secondaryMessages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        )}
      </div>

      {achievements.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Achievements
          </p>
          <div className="flex flex-wrap gap-2">
            {achievements.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 shadow-sm dark:bg-amber-900/40 dark:text-amber-200"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {comparisonMessages.length > 0 && (
        <div className="border-t border-dashed border-slate-200 pt-2 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">
            Compared to your previous battle:
          </p>
          <ul className="list-disc space-y-0.5 pl-4">
            {comparisonMessages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}


