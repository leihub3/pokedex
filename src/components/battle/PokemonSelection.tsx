"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getPokemonById, getAllPokemonList } from "@/lib/api/pokemon";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { Badge } from "@/components/ui/Badge";
import type { Pokemon, PokemonListItem } from "@/types/api";
import Image from "next/image";

interface PokemonSelectionProps {
  onPokemonSelected: (pokemon1: Pokemon, pokemon2: Pokemon) => void;
  isStarting: boolean;
}

export function PokemonSelection({
  onPokemonSelected,
  isStarting,
}: PokemonSelectionProps) {
  const [pokemon1, setPokemon1] = useState<Pokemon | null>(null);
  const [pokemon2, setPokemon2] = useState<Pokemon | null>(null);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);
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

  const handleSearch1 = async (searchTerm?: string) => {
    const term = searchTerm || search1;
    if (!term.trim()) return;
    setIsLoading1(true);
    setError1(null);
    try {
      const pokemon = await getPokemonById(term.toLowerCase());
      setPokemon1(pokemon);
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        setError1(`Pokémon "${term}" not found.`);
      } else {
        setError1("Failed to fetch Pokémon.");
      }
      setPokemon1(null);
    } finally {
      setIsLoading1(false);
    }
  };

  const handleSearch2 = async (searchTerm?: string) => {
    const term = searchTerm || search2;
    if (!term.trim()) return;
    setIsLoading2(true);
    setError2(null);
    try {
      const pokemon = await getPokemonById(term.toLowerCase());
      setPokemon2(pokemon);
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        setError2(`Pokémon "${term}" not found.`);
      } else {
        setError2("Failed to fetch Pokémon.");
      }
      setPokemon2(null);
    } finally {
      setIsLoading2(false);
    }
  };

  const handleStartBattle = () => {
    if (pokemon1 && pokemon2) {
      onPokemonSelected(pokemon1, pokemon2);
    }
  };

  const canStart = pokemon1 && pokemon2 && !isStarting;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pokemon 1 Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Pokémon 1
          </h2>
          <div className="flex gap-2">
            <AutocompleteInput
              value={search1}
              onChange={(value) => {
                setSearch1(value);
                if (error1) setError1(null);
              }}
              onSelect={handleSearch1}
              options={allPokemonNames}
              placeholder="Name or ID..."
              className="flex-1"
              maxSuggestions={8}
              disabled={isLoadingNames || isLoading1 || isStarting}
            />
            <button
              onClick={() => handleSearch1()}
              disabled={isLoading1 || isLoadingNames || isStarting}
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800"
            >
              <div className="flex items-center gap-4">
                {pokemon1.sprites.other["official-artwork"].front_default && (
                  <div className="relative h-24 w-24 flex-shrink-0">
                    <Image
                      src={
                        pokemon1.sprites.other["official-artwork"].front_default
                      }
                      alt={pokemon1.name}
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
                    {pokemon1.name}
                  </h3>
                  <div className="flex gap-1">
                    {pokemon1.types.map((type) => (
                      <Badge
                        key={type.slot}
                        variant="type"
                        typeName={type.type.name}
                      >
                        {type.type.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Pokemon 2 Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Pokémon 2
          </h2>
          <div className="flex gap-2">
            <AutocompleteInput
              value={search2}
              onChange={(value) => {
                setSearch2(value);
                if (error2) setError2(null);
              }}
              onSelect={handleSearch2}
              options={allPokemonNames}
              placeholder="Name or ID..."
              className="flex-1"
              maxSuggestions={8}
              disabled={isLoadingNames || isLoading2 || isStarting}
            />
            <button
              onClick={() => handleSearch2()}
              disabled={isLoading2 || isLoadingNames || isStarting}
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800"
            >
              <div className="flex items-center gap-4">
                {pokemon2.sprites.other["official-artwork"].front_default && (
                  <div className="relative h-24 w-24 flex-shrink-0">
                    <Image
                      src={
                        pokemon2.sprites.other["official-artwork"].front_default
                      }
                      alt={pokemon2.name}
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
                    {pokemon2.name}
                  </h3>
                  <div className="flex gap-1">
                    {pokemon2.types.map((type) => (
                      <Badge
                        key={type.slot}
                        variant="type"
                        typeName={type.type.name}
                      >
                        {type.type.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Start Battle Button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: canStart ? 1.05 : 1 }}
          whileTap={{ scale: canStart ? 0.95 : 1 }}
          onClick={handleStartBattle}
          disabled={!canStart}
          className={`rounded-lg px-8 py-3 text-lg font-semibold text-white transition-all ${
            canStart
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isStarting ? (
            <span className="flex items-center gap-2">
              <LoaderSpinner size="sm" />
              Starting Battle...
            </span>
          ) : (
            "Start Battle"
          )}
        </motion.button>
      </div>
    </div>
  );
}



