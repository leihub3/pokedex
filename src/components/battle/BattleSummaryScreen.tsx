"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { BattleStats } from "@/hooks/useBattleStats";
import type { ActivePokemon } from "@/battle-engine";

interface AggregateCoreStats {
  totalTurns: number;
  damageDealt: number;
  damageReceived: number;
  battleDuration: number;
}

interface BattleSummaryScreenProps {
  stats: BattleStats;
  /** Optional aggregated stats across multiple battles (e.g. best-of-3 matchup) */
  aggregateStats?: AggregateCoreStats;
  winner: number | null;
  pokemon1: ActivePokemon | null;
  pokemon2: ActivePokemon | null;
  pokemon1Sprite: string | null;
  pokemon2Sprite: string | null;
  onClose: () => void;
  onReviewBattle?: () => void;
  autoDismissDelay?: number;
}

export function BattleSummaryScreen({
  stats,
  aggregateStats,
  winner,
  pokemon1,
  pokemon2,
  pokemon1Sprite,
  pokemon2Sprite,
  onClose,
  onReviewBattle,
  autoDismissDelay,
}: BattleSummaryScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showFullStats, setShowFullStats] = useState(false);

  useEffect(() => {
    // Only set up auto-dismiss timer if autoDismissDelay is provided
    if (autoDismissDelay === undefined || autoDismissDelay === null) {
      return;
    }
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
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

  const movesArray = Array.from(stats.movesUsed.entries());
  const mostUsedMove = movesArray.length > 0
    ? movesArray.sort((a, b) => b[1].count - a[1].count)[0]
    : null;

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const badges: string[] = [];
  if (stats.totalTurns < 3) badges.push("Fast Victory");
  if (stats.damageReceived.pokemon0 === 0 && winner === 0) badges.push("Perfect Defense");
  const superEffectiveCount = stats.effectivenessCounts.get(2) || 0;
  if (superEffectiveCount >= 5) badges.push("Type Master");
  const totalCrits = stats.criticalHits.pokemon0 + stats.criticalHits.pokemon1;
  if (totalCrits >= 3) badges.push("Critical Master");

  const hpHistory = stats.hpHistory || [];
  const maxHP1 = pokemon1?.maxHP || 100;
  const maxHP2 = pokemon2?.maxHP || 100;
  const chartHeight = 150;
  const chartWidth = 400;

  // Values to display in the top cards (can be aggregated across multiple battles)
  const displayTotalTurns = aggregateStats?.totalTurns ?? stats.totalTurns;
  const displayBattleDuration =
    aggregateStats?.battleDuration ?? stats.battleDuration;
  const displayDamageDealt =
    aggregateStats?.damageDealt ?? stats.damageDealt.pokemon0;
  const displayDamageReceived =
    aggregateStats?.damageReceived ?? stats.damageReceived.pokemon0;

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
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-500 p-4 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Battle Summary</h2>
                <button
                  onClick={handleClose}
                  className="rounded-full p-1 text-white hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
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
                        <Image src={winnerSprite} alt={winnerName} fill className="object-contain" sizes="128px" />
                      </motion.div>
                    )}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{winnerName} Wins!</h3>
                  {badges.length > 0 && (
                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                      {badges.map((badge) => (
                        <span key={badge} className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-semibold text-gray-900">
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Turns</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {displayTotalTurns}
                    {displayTotalTurns === 1 && !stats.lastTurnComplete && (
                      <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">(ended early)</span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatDuration(displayBattleDuration)}
                  </div>
                </div>
                {pokemon1 && (
                  <>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{pokemon1.pokemon.name} Damage Dealt</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {displayDamageDealt}
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{pokemon1.pokemon.name} Damage Received</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {displayDamageReceived}
                      </div>
                    </div>
                  </>
                )}
                {mostUsedMove && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900 sm:col-span-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Most Used Move</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {mostUsedMove[0].split("_").slice(1).join("_")} ({mostUsedMove[1].count}x)
                    </div>
                  </div>
                )}
              </div>

              {hpHistory.length > 0 && (
                <div className="mt-4">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">HP Timeline</h3>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="relative h-[150px] w-full">
                      <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="hp1Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="hp2Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {[0, 25, 50, 75, 100].map((percent) => (
                          <line key={percent} x1="0" y1={(percent / 100) * chartHeight} x2={chartWidth} y2={(percent / 100) * chartHeight} stroke="currentColor" strokeWidth="1" opacity="0.1" className="text-gray-400" />
                        ))}
                        {hpHistory.length > 1 && (
                          <>
                            <polyline
                              points={hpHistory.map((point, idx) => `${(idx / Math.max(1, hpHistory.length - 1)) * chartWidth},${((1 - point.pokemon0 / maxHP1) * chartHeight)}`).join(" ")}
                              fill="none"
                              stroke="rgb(59, 130, 246)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <polygon
                              points={`0,${chartHeight} ${hpHistory.map((point, idx) => `${(idx / Math.max(1, hpHistory.length - 1)) * chartWidth},${((1 - point.pokemon0 / maxHP1) * chartHeight)}`).join(" ")},${chartWidth},${chartHeight}`}
                              fill="url(#hp1Gradient)"
                            />
                          </>
                        )}
                        {hpHistory.length > 1 && (
                          <>
                            <polyline
                              points={hpHistory.map((point, idx) => `${(idx / Math.max(1, hpHistory.length - 1)) * chartWidth},${((1 - point.pokemon1 / maxHP2) * chartHeight)}`).join(" ")}
                              fill="none"
                              stroke="rgb(239, 68, 68)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <polygon
                              points={`0,${chartHeight} ${hpHistory.map((point, idx) => `${(idx / Math.max(1, hpHistory.length - 1)) * chartWidth},${((1 - point.pokemon1 / maxHP2) * chartHeight)}`).join(" ")},${chartWidth},${chartHeight}`}
                              fill="url(#hp2Gradient)"
                            />
                          </>
                        )}
                      </svg>
                      <div className="mt-2 flex items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-blue-500" />
                          <span className="text-gray-700 dark:text-gray-300">{pokemon1?.pokemon.name || "Pokemon 1"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                          <span className="text-gray-700 dark:text-gray-300">{pokemon2?.pokemon.name || "Pokemon 2"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stats.movesUsed.size > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowFullStats(!showFullStats)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-left font-semibold text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                  >
                    {showFullStats ? "▼" : "▶"} Move Usage Breakdown
                  </button>
                  {showFullStats && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-2 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                        {Array.from(stats.movesUsed.entries())
                          .sort((a, b) => b[1].count - a[1].count)
                          .map(([moveKey, moveData]) => {
                            const moveName = moveKey.split("_").slice(1).join("_");
                            const pokemonName = moveData.pokemonIndex === 0 ? pokemon1?.pokemon.name : pokemon2?.pokemon.name;
                            return (
                              <div key={moveKey} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300">{moveName} ({pokemonName})</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{moveData.count}x</span>
                              </div>
                            );
                          })}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex justify-between gap-2">
                {onReviewBattle && (
                  <button onClick={() => { handleClose(); setTimeout(onReviewBattle, 300); }} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700">
                    Review Battle
                  </button>
                )}
                <button onClick={handleClose} className="ml-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
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


