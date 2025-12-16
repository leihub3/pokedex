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
import { getAllEliteFourConfigs } from "@/data/eliteFour";
import type { Move as EngineMove } from "@/battle-engine";
import { useEliteFourCareerStore } from "@/store/eliteFourCareerStore";
import { EliteFourCareerProgress } from "./EliteFourCareerProgress";
import Image from "next/image";

interface EliteFourLobbyProps {
  config?: EliteFourConfig;
  onStart: (userPokemon: Pokemon, selectedMoves: EngineMove[], selectedConfig: EliteFourConfig) => void;
  isStarting: boolean;
}

export function EliteFourLobby({
  config: initialConfig,
  onStart,
  isStarting,
}: EliteFourLobbyProps) {
  const {
    gameMode,
    setGameMode,
    careerProgress,
    isRegionUnlocked,
    startCareer,
    startMasterMode,
    getMasterModeCurrentRegion,
  } = useEliteFourCareerStore();
  
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const availableRegions = getAllEliteFourConfigs();

  // In Career Mode, start with current region; in Master Mode, use current Master Mode region
  const initialRegionId =
    gameMode === "career" && careerProgress.currentRegion
      ? careerProgress.currentRegion
      : gameMode === "master"
      ? getMasterModeCurrentRegion()?.id || "kanto"
      : initialConfig?.id || "kanto";

  const [selectedRegionId, setSelectedRegionId] = useState<string>(initialRegionId);

  // Filter regions based on mode
  const selectableRegions =
    gameMode === "free"
      ? availableRegions.filter((r) => isRegionUnlocked(r.id))
      : gameMode === "career"
      ? availableRegions.filter(
          (r) =>
            isRegionUnlocked(r.id) &&
            !careerProgress.completedRegions.includes(r.id)
        )
      : availableRegions; // Master Mode: all regions

  const currentConfig =
    availableRegions.find((r) => r.id === selectedRegionId) ||
    selectableRegions[0] ||
    availableRegions[0];

  // Update selected region when mode changes
  useEffect(() => {
    if (gameMode === "career" && careerProgress.currentRegion) {
      setSelectedRegionId(careerProgress.currentRegion);
    } else if (gameMode === "master") {
      setSelectedRegionId("kanto"); // Start from beginning in Master Mode
    }
  }, [gameMode, careerProgress.currentRegion]);

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
          ...currentConfig.members.map((m) => m.pokemonId),
          currentConfig.champion.pokemonId,
        ];
        const pokemonPromises = pokemonIds.map((id) => getPokemonById(id));
        const pokemon = await Promise.all(pokemonPromises);
        setOpponentPokemon(pokemon);
      } catch (error) {
        console.error("Error loading opponent Pokemon:", error);
      }
    };
    loadOpponentPokemon();
  }, [currentConfig]);

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
      // Pass the current selected config to onStart
      onStart(userPokemon, selectedMoves, currentConfig);
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
          {currentConfig.name}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Face the Elite Four and become the Champion!
        </p>
      </motion.div>

      {/* Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800"
      >
        <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">
          Game Mode:
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setGameMode("free");
              setSelectedRegionId(initialConfig?.id || "kanto");
            }}
            className={`flex-1 rounded-lg border-2 px-4 py-2 font-semibold transition-all ${
              gameMode === "free"
                ? "border-blue-500 bg-blue-500 text-white shadow-md"
                : "border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Free Play
          </button>
          <button
            onClick={() => {
              setGameMode("career");
              startCareer();
            }}
            className={`flex-1 rounded-lg border-2 px-4 py-2 font-semibold transition-all ${
              gameMode === "career"
                ? "border-green-500 bg-green-500 text-white shadow-md"
                : "border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Career Mode
          </button>
          <button
            onClick={() => {
              if (careerProgress.masterModeUnlocked) {
                setGameMode("master");
                startMasterMode();
              }
            }}
            disabled={!careerProgress.masterModeUnlocked}
            className={`flex-1 rounded-lg border-2 px-4 py-2 font-semibold transition-all ${
              gameMode === "master"
                ? "border-purple-500 bg-purple-500 text-white shadow-md"
                : !careerProgress.masterModeUnlocked
                ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 opacity-50 dark:border-gray-700 dark:bg-gray-800"
                : "border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            }`}
            title={
              !careerProgress.masterModeUnlocked
                ? "Complete all 6 regions to unlock Master Mode"
                : "Challenge all regions in sequence"
            }
          >
            Master Mode {!careerProgress.masterModeUnlocked && "🔒"}
          </button>
        </div>
      </motion.div>

      {/* Region Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-lg border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800"
      >
        <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">
          Select Region:
        </label>
        {gameMode === "master" ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-purple-300 bg-purple-50 p-3 text-center text-sm text-purple-800 dark:border-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
              Master Mode: Region {careerProgress.masterModeCurrentRegionIndex + 1} of {getAllEliteFourConfigs().length}
              {getMasterModeCurrentRegion() && ` - ${getMasterModeCurrentRegion()?.name}`}
            </div>
            {careerProgress.masterModeRegionsCompleted.length > 0 && (
              <button
                onClick={() => setShowRestartConfirm(true)}
                className="w-full rounded-lg border-2 border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-600 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              >
                Restart Master Mode
              </button>
            )}
          </div>
        ) : (
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            disabled={gameMode === "career"}
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 transition-colors hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:border-blue-500"
          >
            {selectableRegions.map((region) => {
              const isUnlocked = isRegionUnlocked(region.id);
              const isCompleted = careerProgress.completedRegions.includes(region.id);
              return (
                <option key={region.id} value={region.id} disabled={!isUnlocked}>
                  {region.name}
                  {!isUnlocked && " 🔒"}
                  {isCompleted && " ✓"}
                  {gameMode === "career" && careerProgress.currentRegion === region.id && " (Current)"}
                </option>
              );
            })}
          </select>
        )}
        {gameMode === "career" && careerProgress.currentRegion && (
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Career Mode: Currently at {availableRegions.find((r) => r.id === careerProgress.currentRegion)?.name || "Unknown"}
          </p>
        )}
      </motion.div>

      {/* Restart Confirmation Dialog */}
      {showRestartConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowRestartConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-lg border-2 border-red-300 bg-white p-6 shadow-xl dark:border-red-600 dark:bg-gray-800"
          >
            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">
              Restart Master Mode?
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              This will reset your current Master Mode progress and start from Kanto. All progress in this Master Mode run will be lost. Are you sure?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  startMasterMode();
                  setShowRestartConfirm(false);
                }}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600"
              >
                Yes, Restart
              </button>
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Career Progress (shown in Career Mode or if any progress exists) */}
      {(gameMode === "career" || careerProgress.completedRegions.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
        >
          <EliteFourCareerProgress />
        </motion.div>
      )}

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
        {/* Horizontal Carousel for Mobile, Grid for Desktop */}
        <div 
          className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-5 md:overflow-x-visible md:pb-0"
          style={{ 
            scrollbarWidth: 'thin', 
            scrollbarColor: 'rgb(209 213 219) transparent' 
          }}
        >
          {currentConfig.members.map((member, index) => {
            const pokemon = opponentPokemon.find((p) => p.id === member.pokemonId);
            return (
              <div
                key={member.id}
                className="flex min-w-[140px] flex-shrink-0 flex-col items-center rounded-lg bg-white p-4 shadow-md dark:bg-gray-800 md:min-w-0"
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
          <div className="flex min-w-[140px] flex-shrink-0 flex-col items-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 p-4 shadow-md md:min-w-0">
            {opponentPokemon.find((p) => p.id === currentConfig.champion.pokemonId) && (
              <>
                <div className="relative mb-2 h-20 w-20">
                  <Image
                    src={
                      opponentPokemon
                        .find((p) => p.id === currentConfig.champion.pokemonId)
                        ?.sprites.other["official-artwork"]?.front_default ||
                      opponentPokemon.find((p) => p.id === currentConfig.champion.pokemonId)
                        ?.sprites.front_default ||
                      ""
                    }
                    alt={currentConfig.champion.name}
                    fill
                    className="object-contain"
                    sizes="80px"
                  />
                </div>
                <p className="mb-1 text-sm font-bold text-white">
                  {currentConfig.champion.name}
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

