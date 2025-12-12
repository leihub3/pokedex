"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTeamStore } from "@/store/teamStore";
import { TeamStatsChart } from "@/components/charts/TeamStatsChart";
import { TeamSlot } from "./TeamSlot";
import { TypeWeaknessSummary } from "./TypeWeaknessSummary";
import { TeamRecommendations } from "./TeamRecommendations";
import { getPokemonById, getAllPokemonList } from "@/lib/api/pokemon";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import type { Pokemon, PokemonListItem } from "@/types/api";

export function TeamBuilderClient() {
  const { team, addToTeam, removeFromTeam, clearTeam, getTeamStats } =
    useTeamStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [draggingSlot, setDraggingSlot] = useState<number | null>(null);
  const [allPokemonNames, setAllPokemonNames] = useState<string[]>([]);
  const [isLoadingNames, setIsLoadingNames] = useState(true);

  // Load all Pokémon names for autocomplete
  useEffect(() => {
    const loadPokemonNames = async () => {
      try {
        const response = await getAllPokemonList();
        const names = response.results.map((item: PokemonListItem) => item.name);
        setAllPokemonNames(names);
      } catch (error) {
        console.error("Error loading Pokémon names:", error);
      } finally {
        setIsLoadingNames(false);
      }
    };
    loadPokemonNames();
  }, []);

  const handleSearch = async (searchTerm?: string) => {
    const term = searchTerm || searchQuery;
    if (!term.trim()) return;
    setIsSearching(true);
    try {
      // Try to search by name or ID
      const pokemon = await getPokemonById(term.toLowerCase());
      setSearchResults([pokemon]);
      setSearchQuery(""); // Clear search after successful result
    } catch (error) {
      console.error("Error searching pokemon:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDrop = (pokemon: Pokemon, slot: number) => {
    addToTeam(pokemon, slot);
  };

  const handleDragStart = (slot: number) => {
    setDraggingSlot(slot);
  };

  const handleDragEnd = () => {
    setDraggingSlot(null);
  };

  const handleSlotDragEnd = () => {
    handleDragEnd();
  };

  const teamPokemon = team.filter((p): p is Pokemon => p !== null);

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="flex gap-4">
        <AutocompleteInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSelect={handleSearch}
          options={allPokemonNames}
          placeholder="Search Pokémon by name or ID..."
          className="flex-1"
          maxSuggestions={8}
          disabled={isLoadingNames || isSearching}
        />
        <button
          onClick={() => handleSearch()}
          disabled={isSearching || isLoadingNames}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSearching ? <LoaderSpinner size="sm" /> : "Search"}
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
          <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            Search Results
          </h3>
          <div className="space-y-2">
            {searchResults.map((pokemon) => (
              <div
                key={pokemon.id}
                draggable
                onDragStart={(e: React.DragEvent) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify(pokemon)
                  );
                }}
                className="flex cursor-move items-center justify-between rounded border border-gray-200 bg-gray-50 p-3 transition-transform hover:scale-[1.02] dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex items-center gap-3">
                  {pokemon.sprites.front_default && (
                    <img
                      src={pokemon.sprites.front_default}
                      alt={pokemon.name}
                      className="h-12 w-12 object-contain"
                    />
                  )}
                  <div>
                    <p className="font-semibold capitalize text-gray-900 dark:text-gray-100">
                      {pokemon.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      #{String(pokemon.id).padStart(3, "0")}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Drag to slot
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Slots */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Your Team ({teamPokemon.length}/6)
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
            <TeamSlot
              key={slot}
              pokemon={pokemon}
              slot={slot}
              onRemove={() => removeFromTeam(slot)}
              onDrop={(p) => handleDrop(p, slot)}
              isDragging={draggingSlot === slot}
              onDragStart={handleDragStart}
              onDragEnd={handleSlotDragEnd}
            />
          ))}
        </div>
      </div>

      {/* Team Analysis */}
      {teamPokemon.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Team Stats */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
            <TeamStatsChart team={teamPokemon} />
          </div>

          {/* Type Analysis */}
          <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
            <TypeWeaknessSummary team={teamPokemon} />
            <TeamRecommendations team={teamPokemon} />
          </div>
        </div>
      )}
    </div>
  );
}

