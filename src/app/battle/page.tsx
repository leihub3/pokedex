"use client";

import { BattleArena } from "@/components/battle/BattleArena";
import { PokemonSelection } from "@/components/battle/PokemonSelection";

export default function BattlePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            Battle Arena
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Watch Pokémon battle in real-time with animated turns
          </p>
        </div>
        <BattleArena />
      </div>
    </div>
  );
}



