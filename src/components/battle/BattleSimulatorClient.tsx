"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getPokemonById } from "@/lib/api/pokemon";
import { calculateBattleOutcome } from "@/lib/utils/battleCalculations";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { Badge } from "@/components/ui/Badge";
import type { Pokemon } from "@/types/api";

export function BattleSimulatorClient() {
  const [pokemon1, setPokemon1] = useState<Pokemon | null>(null);
  const [pokemon2, setPokemon2] = useState<Pokemon | null>(null);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<ReturnType<
    typeof calculateBattleOutcome
  > | null>(null);

  const handleSearch1 = async () => {
    if (!search1.trim()) return;
    setIsLoading1(true);
    setError1(null);
    setPokemon1(null);
    try {
      const pokemon = await getPokemonById(search1.toLowerCase());
      setPokemon1(pokemon);
      setError1(null);
      if (pokemon2) {
        const result = calculateBattleOutcome(pokemon, pokemon2);
        setBattleResult(result);
      }
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        setError1(`Pokémon "${search1}" not found. Please check the spelling and try again.`);
      } else {
        setError1("Failed to fetch Pokémon. Please try again.");
      }
      setPokemon1(null);
      setBattleResult(null);
    } finally {
      setIsLoading1(false);
    }
  };

  const handleSearch2 = async () => {
    if (!search2.trim()) return;
    setIsLoading2(true);
    setError2(null);
    setPokemon2(null);
    try {
      const pokemon = await getPokemonById(search2.toLowerCase());
      setPokemon2(pokemon);
      setError2(null);
      if (pokemon1) {
        const result = calculateBattleOutcome(pokemon1, pokemon);
        setBattleResult(result);
      }
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        setError2(`Pokémon "${search2}" not found. Please check the spelling and try again.`);
      } else {
        setError2("Failed to fetch Pokémon. Please try again.");
      }
      setPokemon2(null);
      setBattleResult(null);
    } finally {
      setIsLoading2(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Pokemon Selectors */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Pokémon 1
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={search1}
              onChange={(e) => {
                setSearch1(e.target.value);
                if (error1) setError1(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch1()}
              placeholder="Name or ID..."
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              onClick={handleSearch1}
              disabled={isLoading1}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading1 ? <LoaderSpinner size="sm" /> : "Search"}
            </button>
          </div>
          {error1 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error1}</p>
            </div>
          )}
          {pokemon1 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-2 text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
                {pokemon1.name}
              </h3>
              <div className="flex gap-2">
                {pokemon1.types.map((type) => (
                  <Badge key={type.slot} variant="type" typeName={type.type.name}>
                    {type.type.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Pokémon 2
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={search2}
              onChange={(e) => {
                setSearch2(e.target.value);
                if (error2) setError2(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch2()}
              placeholder="Name or ID..."
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            <button
              onClick={handleSearch2}
              disabled={isLoading2}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading2 ? <LoaderSpinner size="sm" /> : "Search"}
            </button>
          </div>
          {error2 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error2}</p>
            </div>
          )}
          {pokemon2 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-2 text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
                {pokemon2.name}
              </h3>
              <div className="flex gap-2">
                {pokemon2.types.map((type) => (
                  <Badge key={type.slot} variant="type" typeName={type.type.name}>
                    {type.type.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Battle Result */}
      {battleResult && pokemon1 && pokemon2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800"
        >
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Battle Result
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold capitalize text-gray-900 dark:text-gray-100">
                {pokemon1.name}
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(battleResult.pokemon1WinProbability * 100).toFixed(1)}% Win
                Chance
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg Damage: {battleResult.pokemon1AvgDamage}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Turns to Win: {battleResult.turnsToWin1}
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold capitalize text-gray-900 dark:text-gray-100">
                {pokemon2.name}
              </h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {(battleResult.pokemon2WinProbability * 100).toFixed(1)}% Win
                Chance
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg Damage: {battleResult.pokemon2AvgDamage}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Turns to Win: {battleResult.turnsToWin2}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

