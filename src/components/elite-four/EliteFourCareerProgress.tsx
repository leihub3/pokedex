"use client";

import { motion } from "framer-motion";
import { useEliteFourCareerStore } from "@/store/eliteFourCareerStore";
import { getAllEliteFourConfigs } from "@/data/eliteFour";
import Image from "next/image";

export function EliteFourCareerProgress() {
  const { careerProgress, getCareerProgressPercentage } = useEliteFourCareerStore();
  const allRegions = getAllEliteFourConfigs();
  const progressPercentage = getCareerProgressPercentage();

  return (
    <div className="rounded-lg border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-lg dark:from-purple-900/20 dark:to-indigo-900/20">
      <h2 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
        Career Progress
      </h2>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            Regions Completed
          </span>
          <span className="font-bold text-purple-600 dark:text-purple-400">
            {careerProgress.completedRegions.length} / {allRegions.length}
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
          />
        </div>
      </div>

      {/* Regions Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {allRegions.map((region, index) => {
          const isUnlocked = careerProgress.unlockedRegions.includes(region.id);
          const isCompleted = careerProgress.completedRegions.includes(region.id);
          const isCurrent = careerProgress.currentRegion === region.id;

          return (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative flex flex-col items-center rounded-lg border-2 p-3 transition-all ${
                isCompleted
                  ? "border-green-500 bg-green-50 shadow-md dark:border-green-400 dark:bg-green-900/20"
                  : isCurrent
                  ? "border-blue-500 bg-blue-50 shadow-md dark:border-blue-400 dark:bg-blue-900/20"
                  : isUnlocked
                  ? "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                  : "border-gray-200 bg-gray-100 opacity-60 dark:border-gray-700 dark:bg-gray-900"
              }`}
            >
              {/* Lock Icon */}
              {!isUnlocked && (
                <div className="absolute right-1 top-1 text-2xl">🔒</div>
              )}

              {/* Checkmark for completed */}
              {isCompleted && (
                <div className="absolute right-1 top-1 text-2xl">✓</div>
              )}

              {/* Current indicator */}
              {isCurrent && !isCompleted && (
                <div className="absolute right-1 top-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                  →
                </div>
              )}

              {/* Region Number */}
              <div
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-blue-500 text-white"
                    : isUnlocked
                    ? "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                    : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                {index + 1}
              </div>

              {/* Region Name */}
              <p
                className={`text-center text-xs font-semibold ${
                  isCompleted
                    ? "text-green-700 dark:text-green-400"
                    : isCurrent
                    ? "text-blue-700 dark:text-blue-400"
                    : isUnlocked
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {region.name.replace(" Elite Four", "")}
              </p>

              {/* Status Text */}
              <p className="mt-1 text-center text-xs">
                {isCompleted ? (
                  <span className="text-green-600 dark:text-green-400">Completed</span>
                ) : isCurrent ? (
                  <span className="text-blue-600 dark:text-blue-400">Current</span>
                ) : isUnlocked ? (
                  <span className="text-gray-600 dark:text-gray-400">Unlocked</span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">Locked</span>
                )}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Master Mode Status */}
      {careerProgress.masterModeUnlocked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-lg border-2 border-purple-400 bg-purple-100 p-4 text-center dark:border-purple-600 dark:bg-purple-900/30"
        >
          <div className="text-3xl mb-2">👑</div>
          <p className="font-bold text-purple-700 dark:text-purple-300">
            Master Mode Unlocked!
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            Challenge all regions in sequence
          </p>
        </motion.div>
      )}
    </div>
  );
}

