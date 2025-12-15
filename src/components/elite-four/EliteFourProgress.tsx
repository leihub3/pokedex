"use client";

import { motion } from "framer-motion";
import type { EliteFourConfig, EliteFourMember, EliteFourChampion } from "@/data/eliteFour";
import type { Pokemon } from "@/types/api";
import Image from "next/image";

interface EliteFourProgressProps {
  config: EliteFourConfig;
  currentOpponentIndex: number | null;
  defeatedOpponents: string[];
  userPokemon: Pokemon | null;
  opponentPokemon: Pokemon[];
  currentRound?: number;
  roundWins?: { user: number; opponent: number };
}

export function EliteFourProgress({
  config,
  currentOpponentIndex,
  defeatedOpponents,
  userPokemon,
  opponentPokemon,
  currentRound = 1,
  roundWins = { user: 0, opponent: 0 },
}: EliteFourProgressProps) {
  const isDefeated = (opponentId: string) => defeatedOpponents.includes(opponentId);
  const isCurrent = (index: number) => currentOpponentIndex === index;
  
  const getOpponentPokemon = (pokemonId: number) => {
    return opponentPokemon.find((p) => p.id === pokemonId);
  };

  const getCurrentOpponent = () => {
    if (currentOpponentIndex === null) return null;
    if (currentOpponentIndex < config.members.length) {
      return config.members[currentOpponentIndex];
    } else if (currentOpponentIndex === config.members.length) {
      return config.champion;
    }
    return null;
  };

  const currentOpponent = getCurrentOpponent();

  return (
    <div className="mb-6 rounded-lg border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 shadow-lg dark:from-purple-900/20 dark:to-indigo-900/20">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Progress
        </h2>
        {userPokemon && (
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10">
              <Image
                src={
                  userPokemon.sprites.other["official-artwork"]?.front_default ||
                  userPokemon.sprites.front_default ||
                  ""
                }
                alt={userPokemon.name}
                fill
                className="object-contain"
                sizes="40px"
              />
            </div>
            <span className="font-semibold capitalize text-gray-900 dark:text-gray-100">
              {userPokemon.name}
            </span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-5">
        {/* Elite Four Members */}
        {config.members.map((member, index) => {
          const defeated = isDefeated(member.id);
          const current = isCurrent(index);
          const pokemon = getOpponentPokemon(member.pokemonId);
          
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: defeated ? 0.6 : current ? 1 : 0.8,
                scale: current ? 1.05 : 1,
              }}
              className={`relative rounded-lg border-2 p-3 transition-all ${
                current
                  ? "border-yellow-500 bg-yellow-100 shadow-lg ring-2 ring-yellow-400 dark:border-yellow-400 dark:bg-yellow-900/30"
                  : defeated
                  ? "border-gray-300 bg-gray-100 grayscale dark:border-gray-600 dark:bg-gray-800"
                  : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
              }`}
            >
              {defeated && (
                <div className="absolute right-2 top-2">
                  <span className="text-2xl">✓</span>
                </div>
              )}
              {current && (
                <div className="absolute left-2 top-2 animate-pulse">
                  <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                    NOW
                  </span>
                </div>
              )}
              
              <div className="flex flex-col items-center">
                <div className="relative mb-1 h-12 w-12 sm:mb-2 sm:h-16 sm:w-16">
                  {pokemon ? (
                    <Image
                      src={
                        pokemon.sprites.other["official-artwork"]?.front_default ||
                        pokemon.sprites.front_default ||
                        ""
                      }
                      alt={member.name}
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  ) : (
                    <div className="h-full w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 sm:text-sm">
                  {member.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                  Elite Four
                </p>
              </div>
            </motion.div>
          );
        })}
        
        {/* Champion */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: isDefeated(config.champion.id)
              ? 0.6
              : isCurrent(config.members.length)
              ? 1
              : 0.8,
            scale: isCurrent(config.members.length) ? 1.05 : 1,
          }}
          className={`relative rounded-lg border-2 p-3 transition-all ${
            isCurrent(config.members.length)
              ? "border-yellow-500 bg-gradient-to-br from-yellow-200 to-orange-200 shadow-lg ring-2 ring-yellow-400 dark:border-yellow-400 dark:from-yellow-900/40 dark:to-orange-900/40"
              : isDefeated(config.champion.id)
              ? "border-gray-300 bg-gray-100 grayscale dark:border-gray-600 dark:bg-gray-800"
              : "border-yellow-400 bg-gradient-to-br from-yellow-100 to-orange-100 dark:border-yellow-500 dark:from-yellow-900/20 dark:to-orange-900/20"
          }`}
        >
          {isDefeated(config.champion.id) && (
            <div className="absolute right-2 top-2">
              <span className="text-2xl">✓</span>
            </div>
          )}
          {isCurrent(config.members.length) && (
            <div className="absolute left-2 top-2 animate-pulse">
              <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                NOW
              </span>
            </div>
          )}
          
          <div className="flex flex-col items-center">
            <div className="relative mb-1 h-12 w-12 sm:mb-2 sm:h-16 sm:w-16">
              {getOpponentPokemon(config.champion.pokemonId) ? (
                <Image
                  src={
                    getOpponentPokemon(config.champion.pokemonId)?.sprites.other[
                      "official-artwork"
                    ]?.front_default ||
                    getOpponentPokemon(config.champion.pokemonId)?.sprites.front_default ||
                    ""
                  }
                  alt={config.champion.name}
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              ) : (
                <div className="h-full w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 sm:text-sm">
              {config.champion.name}
            </p>
            <p className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-400 sm:text-xs">
              Champion
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

