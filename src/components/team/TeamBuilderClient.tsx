"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTeamStore } from "@/store/teamStore";
import { TeamStatsChart } from "@/components/charts/TeamStatsChart";
import { getPokemonById } from "@/lib/api/pokemon";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import type { Pokemon } from "@/types/api";

export function TeamBuilderClient() {
  const { team, addToTeam, removeFromTeam, clearTeam, getTeamStats } =
    useTeamStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const pokemon = await getPokemonById(searchQuery.toLowerCase());
      setSearchResults([pokemon]);
    } catch (error) {
      console.error("Error searching pokemon:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addPokemonToSlot = (pokemon: Pokemon, slot: number) => {
    addToTeam(pokemon, slot);
    setSearchQuery("");
    setSearchResults([]);
  };

  const teamPokemon = team.filter((p): p is Pokemon => p !== null);

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search Pokémon by name or ID..."
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSearching ? <LoaderSpinner size="sm" /> : "Search"}
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
          <h3 className="mb-2 font-semibold">Search Results</h3>
          <div className="space-y-2">
            {searchResults.map((pokemon) => (
              <div
                key={pokemon.id}
                className="flex items-center justify-between rounded border border-gray-200 p-2 dark:border-gray-700"
              >
                <span className="capitalize">{pokemon.name}</span>
                <div className="flex gap-2">
                  {team.map((_, slot) => (
                    <button
                      key={slot}
                      onClick={() => addPokemonToSlot(pokemon, slot)}
                      className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                    >
                      Slot {slot + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Slots */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Your Team
          </h2>
          <button
            onClick={clearTeam}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Clear Team
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {team.map((pokemon, slot) => (
            <div
              key={slot}
              className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              {pokemon ? (
                <div>
                  <Link href={`/pokemon/${pokemon.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="cursor-pointer text-center"
                    >
                      <p className="font-semibold capitalize text-gray-900 dark:text-gray-100">
                        {pokemon.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        #{String(pokemon.id).padStart(3, "0")}
                      </p>
                    </motion.div>
                  </Link>
                  <button
                    onClick={() => removeFromTeam(slot)}
                    className="mt-2 w-full rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-500">
                  Slot {slot + 1}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team Stats */}
      {teamPokemon.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
          <TeamStatsChart team={teamPokemon} />
        </div>
      )}
    </div>
  );
}

