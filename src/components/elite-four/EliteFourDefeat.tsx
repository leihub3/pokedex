"use client";

import { motion } from "framer-motion";
import type { EliteFourConfig, EliteFourMember, EliteFourChampion } from "@/data/eliteFour";
import type { Pokemon } from "@/types/api";
import Image from "next/image";

interface EliteFourDefeatProps {
  config: EliteFourConfig;
  userPokemon: Pokemon;
  defeatedBy: EliteFourMember | EliteFourChampion | null;
  defeatedByPokemon: Pokemon | null;
  defeatedOpponents: string[];
  onRestart: () => void;
}

export function EliteFourDefeat({
  config,
  userPokemon,
  defeatedBy,
  defeatedByPokemon,
  defeatedOpponents,
  onRestart,
}: EliteFourDefeatProps) {
  const isChampion = defeatedBy?.id === config.champion.id;
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl rounded-lg border-2 border-red-500 bg-gradient-to-br from-red-50 to-gray-50 p-8 shadow-2xl dark:from-red-900/30 dark:to-gray-900/30"
      >
        {/* Defeat Message */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 text-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="text-6xl mb-4"
          >
            😔
          </motion.div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            Challenge Failed
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            {defeatedBy
              ? `${defeatedBy.title} defeated your ${userPokemon.name}`
              : `Your ${userPokemon.name} was defeated`}
          </p>
        </motion.div>

        {/* Opponent Pokemon */}
        {defeatedBy && defeatedByPokemon && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 flex flex-col items-center rounded-lg bg-white/80 p-6 dark:bg-gray-800/80"
          >
            <div className="relative mb-4 h-32 w-32">
              <Image
                src={
                  defeatedByPokemon.sprites.other["official-artwork"]
                    ?.front_default ||
                  defeatedByPokemon.sprites.front_default ||
                  ""
                }
                alt={defeatedBy.name}
                fill
                className="object-contain"
                sizes="128px"
              />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {defeatedBy.title}
            </p>
            <p className="mt-2 capitalize text-lg text-gray-600 dark:text-gray-400">
              {defeatedByPokemon.name}
            </p>
          </motion.div>
        )}

        {/* Progress Summary */}
        {defeatedOpponents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6 rounded-lg bg-white/60 p-4 dark:bg-gray-800/60"
          >
            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
              Progress Made:
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              You defeated {defeatedOpponents.length} opponent
              {defeatedOpponents.length !== 1 ? "s" : ""} before being defeated.
            </p>
          </motion.div>
        )}

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
            Try Again
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}



