"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { BattleStats } from "@/hooks/useBattleStats";
import type { ActivePokemon } from "@/battle-engine";

interface BattleSummaryScreenProps {
  stats: BattleStats;
  winner: number | null; // 0 or 1, or null for draw
  pokemon1: ActivePokemon | null;
  pokemon2: ActivePokemon | null;
  pokemon1Sprite: string | null;
  pokemon2Sprite: string | null;
  onClose: () => void;
  onReviewBattle?: () => void; // Optional replay button
  autoDismissDelay?: number; // Auto-dismiss after X seconds (default 5)
}

export function BattleSummaryScreen({
  stats,
  winner,
  pokemon1,
  pokemon2,
  pokemon1Sprite,
  pokemon2Sprite,
  onClose,
  onReviewBattle,
  autoDismissDelay = 5000,
}: BattleSummaryScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showFullStats, setShowFullStats] = useState(false);

  // Auto-dismiss after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, autoDismissDelay);

    return () => clearTimeout(timer);
  }, [autoDismissDelay, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const winnerPokemon = winner === 0 ? pokemon1 : winner === 1 ? pokemon2 : null;
  const winnerSprite = winner === 0 ? pokemon1Sprite : winner === 1 ? pokemon2Sprite : null;
  const winnerName = winnerPokemon?.pokemon.name || "Unknown";

  // Calculate most effective move (simplified - shows most used move)
  const movesArray = Array.from(stats.movesUsed.entries());
  const mostUsedMove = movesArray.length > 0
    ? movesArray.sort((a, b) => b[1].count - a[1].count)[0]
    : null;

  // Format battle duration
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Performance badges (simplified for now)
  const badges: string[] = [];
  if (stats.totalTurns < 3) badges.push("Fast Victory");
  if (stats.damageReceived.pokemon0 === 0 && winner === 0) badges.push("Perfect Defense");
  const superEffectiveCount = stats.effectivenessCounts.get(2) || 0;
  if (superEffectiveCount >= 5) badges.push("Type Master");

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-xl border-2 border-gray-300 bg-white shadow-2xl dark:border-gray-600 dark:bg-gray-800"
          >
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-500 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Battle Summary</h2>
                <button
                  onClick={handleClose}
                  className="rounded-full p-1 text-white hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto p-6">
              {/* Winner Announcement */}
              {winner !== null && winnerPokemon && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 text-center"
                >
                  <div className="mb-4 flex justify-center">
                    {winnerSprite && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="relative h-32 w-32"
                      >
                        <Image
                          src={winnerSprite}
                          alt={winnerName}
                          fill
                          className="object-contain"
                          sizes="128px"
                        />
                      </motion.div>
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {winnerName} Wins!
                  </h3>
                  {badges.length > 0 && (
                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                      {badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-semibold text-gray-900"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Total Turns */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Turns</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalTurns}
                  </div>
                </div>

                {/* Battle Duration */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatDuration(stats.battleDuration)}
                  </div>
                </div>

                {/* Damage Dealt */}
                {pokemon1 && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {pokemon1.pokemon.name} Damage Dealt
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.damageDealt.pokemon0}
                    </div>
                  </div>
                )}

                {/* Damage Received */}
                {pokemon1 && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {pokemon1.pokemon.name} Damage Received
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats.damageReceived.pokemon0}
                    </div>
                  </div>
                )}

                {/* Most Effective Move */}
                {mostUsedMove && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900 sm:col-span-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Most Used Move
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {mostUsedMove[0].split("_").slice(1).join("_")} ({mostUsedMove[1].count}x)
                    </div>
                  </div>
                )}
              </div>

              {/* Move Usage Breakdown (Expandable) */}
              {stats.movesUsed.size > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowFullStats(!showFullStats)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-left font-semibold text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                  >
                    {showFullStats ? "▼" : "▶"} Move Usage Breakdown
                  </button>
                  {showFullStats && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                        {Array.from(stats.movesUsed.entries())
                          .sort((a, b) => b[1].count - a[1].count)
                          .map(([moveKey, moveData]) => {
                            const moveName = moveKey.split("_").slice(1).join("_");
                            const pokemonName = moveData.pokemonIndex === 0
                              ? pokemon1?.pokemon.name
                              : pokemon2?.pokemon.name;
                            return (
                              <div
                                key={moveKey}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-gray-700 dark:text-gray-300">
                                  {moveName} ({pokemonName})
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                  {moveData.count}x
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex justify-between gap-2">
                {onReviewBattle && (
                  <button
                    onClick={() => {
                      handleClose();
                      setTimeout(onReviewBattle, 300);
                    }}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
                  >
                    Review Battle
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="ml-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

