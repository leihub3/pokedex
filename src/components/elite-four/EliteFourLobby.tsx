"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getPokemonById, getAllPokemonList } from "@/lib/api/pokemon";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { Badge } from "@/components/ui/Badge";
import { MoveSelectionScreen } from "@/components/battle/MoveSelectionScreen";
import { getAvailablePokemonMoves } from "@/lib/pokemon-api/normalizeForBattle";
import type { Pokemon, PokemonListItem, Move as APIMove } from "@/types/api";
import type { EliteFourConfig } from "@/data/eliteFour";
import type { Move as EngineMove } from "@/battle-engine";
import Image from "next/image";

interface EliteFourLobbyProps {
  config: EliteFourConfig;
  onStart: (userPokemon: Pokemon, selectedMoves: EngineMove[]) => void;
  isStarting: boolean;
}

export function EliteFourLobby({
  config,
  onStart,
  isStarting,
}: EliteFourLobbyProps) {
  const [userPokemon, setUserPokemon] = useState<Pokemon | null>(null);
  const [search, setSearch] = useState("");
  const [isLoadingPokemon, setIsLoadingPokemon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allPokemonNames, setAllPokemonNames] = useState<string[]>([]);
  const [isLoadingNames, setIsLoadingNames] = useState(true);
  const [opponentPokemon, setOpponentPokemon] = useState<Pokemon[]>([]);
  const [availableMoves, setAvailableMoves] = useState<APIMove[]>([]);
  const [isLoadingMoves, setIsLoadingMoves] = useState(false);
  const [showMoveSelection, setShowMoveSelection] = useState(false);

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

  // Load opponent Pokemon sprites for display
  useEffect(() => {
    const loadOpponentPokemon = async () => {
      try {
        const pokemonIds = [
          ...config.members.map((m) => m.pokemonId),
          config.champion.pokemonId,
        ];
        const pokemonPromises = pokemonIds.map((id) => getPokemonById(id));
        const pokemon = await Promise.all(pokemonPromises);
        setOpponentPokemon(pokemon);
      } catch (error) {
        console.error("Error loading opponent Pokemon:", error);
      }
    };
    loadOpponentPokemon();
  }, [config]);

  const handleSearch = async (searchTerm?: string) => {
    const term = searchTerm || search;
    if (!term.trim()) return;
    setIsLoadingPokemon(true);
    setError(null);
    setShowMoveSelection(false);
    setAvailableMoves([]);
    try {
      const pokemon = await getPokemonById(term.toLowerCase());
      setUserPokemon(pokemon);
      
      // Load available moves for move selection
      setIsLoadingMoves(true);
      try {
        const moves = await getAvailablePokemonMoves(pokemon);
        setAvailableMoves(moves);
        if (moves.length > 0) {
          setShowMoveSelection(true);
        } else {
          setError("This Pokémon has no available moves.");
        }
      } catch (moveError) {
        console.error("Error loading moves:", moveError);
        setError("Failed to load moves for this Pokémon.");
      } finally {
        setIsLoadingMoves(false);
      }
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        setError(`Pokémon "${term}" not found.`);
      } else {
        setError("Failed to fetch Pokémon.");
      }
      setUserPokemon(null);
      setShowMoveSelection(false);
      setAvailableMoves([]);
    } finally {
      setIsLoadingPokemon(false);
    }
  };

  const handleMoveConfirm = (selectedMoves: EngineMove[]) => {
    if (userPokemon && selectedMoves.length === 4) {
      onStart(userPokemon, selectedMoves);
    }
  };

  const handleMoveCancel = () => {
    setShowMoveSelection(false);
    setUserPokemon(null);
    setSearch("");
    setAvailableMoves([]);
  };

  const canStart = userPokemon !== null && !isStarting && !showMoveSelection;

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
          {config.name}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Face the Elite Four and become the Champion!
        </p>
      </motion.div>

      {/* Elite Four Members Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-lg border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-lg dark:from-purple-900/20 dark:to-indigo-900/20"
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          Your Challengers
        </h2>
        <div className="grid gap-4 md:grid-cols-5">
          {config.members.map((member, index) => {
            const pokemon = opponentPokemon.find((p) => p.id === member.pokemonId);
            return (
              <div
                key={member.id}
                className="flex flex-col items-center rounded-lg bg-white p-4 shadow-md dark:bg-gray-800"
              >
                <div className="relative mb-2 h-20 w-20">
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
                      sizes="80px"
                    />
                  ) : (
                    <div className="h-full w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                  )}
                </div>
                <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {member.name}
                </p>
                <Badge variant="type" typeName={member.type}>
                  {member.type}
                </Badge>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Elite Four
                </p>
              </div>
            );
          })}
          {/* Champion */}
          <div className="flex flex-col items-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 p-4 shadow-md">
            {opponentPokemon.find((p) => p.id === config.champion.pokemonId) && (
              <>
                <div className="relative mb-2 h-20 w-20">
                  <Image
                    src={
                      opponentPokemon
                        .find((p) => p.id === config.champion.pokemonId)
                        ?.sprites.other["official-artwork"]?.front_default ||
                      opponentPokemon.find((p) => p.id === config.champion.pokemonId)
                        ?.sprites.front_default ||
                      ""
                    }
                    alt={config.champion.name}
                    fill
                    className="object-contain"
                    sizes="80px"
                  />
                </div>
                <p className="mb-1 text-sm font-bold text-white">
                  {config.champion.name}
                </p>
                <p className="text-xs font-semibold text-white">Champion</p>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* User Pokemon Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800"
      >
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Choose Your Pokémon
        </h2>
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-grow">
            <AutocompleteInput
              options={allPokemonNames}
              value={search}
              onChange={setSearch}
              onSelect={handleSearch}
              placeholder="Search your Pokémon..."
              disabled={isLoadingNames || isLoadingPokemon || isStarting}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={
              !search.trim() ||
              isLoadingPokemon ||
              isStarting ||
              isLoadingNames
            }
            className="btn-primary w-full md:w-auto"
          >
            {isLoadingPokemon ? <LoaderSpinner size="sm" /> : "Select"}
          </button>
        </div>

        {error && <p className="mt-4 text-red-500">{error}</p>}

        {userPokemon && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700"
          >
            <div className="relative h-24 w-24 flex-shrink-0">
              <Image
                src={
                  userPokemon.sprites.other["official-artwork"]?.front_default ||
                  userPokemon.sprites.front_default ||
                  ""
                }
                alt={userPokemon.name}
                fill
                className="object-contain"
                sizes="96px"
              />
            </div>
            <div>
              <p className="text-xl font-bold capitalize text-gray-900 dark:text-gray-100">
                {userPokemon.name}
              </p>
              <div className="mt-2 flex gap-2">
                {userPokemon.types.map((typeInfo) => (
                  <Badge
                    key={typeInfo.type.name}
                    variant="type"
                    typeName={typeInfo.type.name}
                  >
                    {typeInfo.type.name}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Move Selection Screen */}
      {showMoveSelection && userPokemon && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <MoveSelectionScreen
            availableMoves={availableMoves}
            onConfirm={handleMoveConfirm}
            onCancel={handleMoveCancel}
            isLoading={isStarting || isLoadingMoves}
          />
        </motion.div>
      )}

      {/* Start Button (only shown when not selecting moves) */}
      {!showMoveSelection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          {userPokemon && !isLoadingMoves && (
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Select your Pokémon to choose moves
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

