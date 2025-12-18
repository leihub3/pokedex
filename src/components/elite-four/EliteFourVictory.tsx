"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { EliteFourConfig } from "@/data/eliteFour";
import type { Pokemon } from "@/types/api";
import type { BattleStats } from "@/hooks/useBattleStats";
import { BattleResultsExtended } from "@/components/battle/BattleResultsExtended";
import { useEliteFourCareerStore } from "@/store/eliteFourCareerStore";
import { getAllEliteFourConfigs } from "@/data/eliteFour";
import Image from "next/image";

interface EliteFourVictoryProps {
  config: EliteFourConfig;
  userPokemon: Pokemon;
  finalStats?: BattleStats;
  winnerIndex?: 0 | 1 | null;
  onRestart: () => void;
  onContinueCareer?: () => void;
}

export function EliteFourVictory({
  config,
  userPokemon,
  finalStats,
  winnerIndex = 0,
  onRestart,
  onContinueCareer,
}: EliteFourVictoryProps) {
  const {
    gameMode,
    careerProgress,
    getMasterModeProgress,
    getMasterModeCurrentRegion,
  } = useEliteFourCareerStore();
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [nextRegion, setNextRegion] = useState<EliteFourConfig | null>(null);
  const [masterModeUnlocked, setMasterModeUnlocked] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  
  const isMasterMode = gameMode === "master";
  const masterModeProgress = isMasterMode ? getMasterModeProgress() : null;
  const isMasterModeComplete = isMasterMode && careerProgress.masterModeCompleted;
  const nextMasterModeRegion = isMasterMode ? getMasterModeCurrentRegion() : null;

  useEffect(() => {
    // Check if a new region was unlocked
    const allRegions = getAllEliteFourConfigs();
    const currentIndex = allRegions.findIndex((r) => r.id === config.id);
    const next = currentIndex < allRegions.length - 1 ? allRegions[currentIndex + 1] : null;

    if (gameMode === "career") {
      // Check if next region was just unlocked
      if (next && careerProgress.unlockedRegions.includes(next.id) && !careerProgress.completedRegions.includes(next.id)) {
        setNextRegion(next);
        setShowUnlockAnimation(true);
      }

      // Check if Master Mode was just unlocked
      if (careerProgress.masterModeUnlocked && !careerProgress.completedRegions.includes(config.id)) {
        // This means we just completed the last region
        setMasterModeUnlocked(true);
      }
    } else if (gameMode === "master" && !isMasterModeComplete && nextMasterModeRegion) {
      // Master Mode: Show countdown for auto-advance
      setAutoAdvanceCountdown(3);
      
      const countdownInterval = setInterval(() => {
        setAutoAdvanceCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    }
  }, [config.id, gameMode, careerProgress, isMasterModeComplete, nextMasterModeRegion]);
  
  // Check if Master Mode is complete
  if (isMasterModeComplete) {
    // Render Master Mode completion screen
    const allRegions = getAllEliteFourConfigs();
    
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl rounded-lg border-2 border-purple-500 bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 p-8 shadow-2xl dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-violet-900/30"
        >
          {/* Master Mode Completion Animation */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6 text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="text-8xl mb-4"
            >
              👑
            </motion.div>
            <h1 className="mb-2 text-6xl font-bold text-purple-900 dark:text-purple-100">
              MASTER MODE COMPLETE!
            </h1>
            <p className="text-3xl text-purple-700 dark:text-purple-300">
              Ultimate Champion!
            </p>
          </motion.div>

          {/* User Pokemon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 flex flex-col items-center rounded-lg bg-white/80 p-6 dark:bg-gray-800/80"
          >
            <div className="relative mb-4 h-40 w-40">
              <Image
                src={
                  userPokemon.sprites.other["official-artwork"]?.front_default ||
                  userPokemon.sprites.front_default ||
                  ""
                }
                alt={userPokemon.name}
                fill
                className="object-contain"
                sizes="160px"
              />
            </div>
            <p className="text-3xl font-bold capitalize text-gray-900 dark:text-gray-100">
              {userPokemon.name}
            </p>
            <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
              Has conquered all 6 regions!
            </p>
          </motion.div>

          {/* All Regions Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6 rounded-lg bg-white/60 p-6 dark:bg-gray-800/60"
          >
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
              Regions Conquered:
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {allRegions.map((region) => (
                <div
                  key={region.id}
                  className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20"
                >
                  <span className="text-2xl">✓</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    {region.name.replace(" Elite Four", "")}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-4 text-center sm:flex-row sm:justify-center"
          >
            <button
              onClick={onRestart}
              className="btn-primary px-8 py-3 text-lg font-bold"
            >
              Return to Lobby
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const handleContinueCareer = () => {
    if (onContinueCareer) {
      onContinueCareer();
    } else {
      onRestart();
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl rounded-lg border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 p-8 shadow-2xl dark:from-yellow-900/30 dark:to-orange-900/30"
      >
        {/* Master Mode Progress Indicator */}
        {isMasterMode && masterModeProgress && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 rounded-lg border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 dark:from-purple-900/30 dark:to-indigo-900/30"
          >
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-bold text-purple-700 dark:text-purple-300">
                Master Mode Progress
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                Region {masterModeProgress.current} of {masterModeProgress.total}
              </span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-purple-200 dark:bg-purple-900/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(masterModeProgress.completed / masterModeProgress.total) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-purple-600 dark:text-purple-400">
              <span>
                Completed: {masterModeProgress.completed}/{masterModeProgress.total}
              </span>
              {nextMasterModeRegion && (
                <span>Next: {nextMasterModeRegion.name.replace(" Elite Four", "")}</span>
              )}
            </div>
            {autoAdvanceCountdown !== null && nextMasterModeRegion && (
              <div className="mt-3 rounded-lg bg-purple-100 p-2 text-center text-sm font-semibold text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                Continuing to {nextMasterModeRegion.name.replace(" Elite Four", "")} in {autoAdvanceCountdown}...
              </div>
            )}
          </motion.div>
        )}

        {/* Victory Animation */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6 text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="text-7xl mb-4"
          >
            🏆
          </motion.div>
          <h1 className="mb-2 text-5xl font-bold text-gray-900 dark:text-gray-100">
            VICTORY!
          </h1>
          <p className="text-2xl text-gray-700 dark:text-gray-300">
            You are the Champion!
          </p>
        </motion.div>

        {/* User Pokemon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 flex flex-col items-center rounded-lg bg-white/80 p-6 dark:bg-gray-800/80"
        >
          <div className="relative mb-4 h-32 w-32">
            <Image
              src={
                userPokemon.sprites.other["official-artwork"]?.front_default ||
                userPokemon.sprites.front_default ||
                ""
              }
              alt={userPokemon.name}
              fill
              className="object-contain"
              sizes="128px"
            />
          </div>
          <p className="text-2xl font-bold capitalize text-gray-900 dark:text-gray-100">
            {userPokemon.name}
          </p>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Has defeated the {config.name}!
          </p>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6 rounded-lg bg-white/60 p-4 dark:bg-gray-800/60"
        >
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
            Defeated Opponents:
          </h2>
          <ul className="space-y-2">
            {config.members.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <span className="text-green-500">✓</span>
                <span className="font-semibold">{member.title}</span>
              </li>
            ))}
            <li className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100">
              <span className="text-yellow-500">🏆</span>
              <span>{config.champion.title}</span>
            </li>
          </ul>
        </motion.div>

        {/* Extended Battle Results (final challenge battle) */}
        {finalStats && (
          <BattleResultsExtended
            stats={finalStats}
            winnerIndex={winnerIndex}
            playerIndex={0}
            storageKey="elite-four"
          />
        )}

        {/* Unlock Messages */}
        {showUnlockAnimation && nextRegion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
            className="mb-6 rounded-lg border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-lg dark:from-green-900/30 dark:to-emerald-900/30"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="mb-2 text-4xl"
              >
                🔓
              </motion.div>
              <h3 className="mb-2 text-2xl font-bold text-green-700 dark:text-green-400">
                New Region Unlocked!
              </h3>
              <p className="text-lg text-green-600 dark:text-green-300">
                {nextRegion.name} is now available!
              </p>
            </div>
          </motion.div>
        )}

        {masterModeUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            className="mb-6 rounded-lg border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 p-6 shadow-lg dark:from-purple-900/30 dark:to-violet-900/30"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="mb-2 text-4xl"
              >
                👑
              </motion.div>
              <h3 className="mb-2 text-2xl font-bold text-purple-700 dark:text-purple-400">
                Master Mode Unlocked!
              </h3>
              <p className="text-lg text-purple-600 dark:text-purple-300">
                Challenge all regions in sequence!
              </p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-4 text-center sm:flex-row sm:justify-center"
        >
          {gameMode === "career" && nextRegion && (
            <button
              onClick={handleContinueCareer}
              className="btn-primary px-8 py-3 text-lg font-bold"
            >
              Continue Career →
            </button>
          )}
          <button
            onClick={onRestart}
            className="rounded-lg border-2 border-gray-300 bg-white px-8 py-3 text-lg font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {gameMode === "career"
              ? "Back to Lobby"
              : gameMode === "master"
              ? "Cancel Auto-Advance"
              : "Challenge Again"}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

