"use client";

import { motion } from "framer-motion";
import type { EliteFourConfig } from "@/data/eliteFour";
import type { Pokemon } from "@/types/api";
import Image from "next/image";

interface EliteFourVictoryProps {
  config: EliteFourConfig;
  userPokemon: Pokemon;
  onRestart: () => void;
}

export function EliteFourVictory({
  config,
  userPokemon,
  onRestart,
}: EliteFourVictoryProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl rounded-lg border-2 border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 p-8 shadow-2xl dark:from-yellow-900/30 dark:to-orange-900/30"
      >
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

        {/* Restart Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <button
            onClick={onRestart}
            className="btn-primary px-8 py-3 text-lg font-bold"
          >
            Challenge Again
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

