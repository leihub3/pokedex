"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { normalizeMoveForBattle } from "@/lib/pokemon-api/normalizeForBattle";
import type { Move as APIMove } from "@/types/api";
import type { Move as EngineMove } from "@/battle-engine";
import { cn } from "@/lib/utils/cn";

interface MoveSelectionScreenProps {
  availableMoves: APIMove[];
  onConfirm: (selectedMoves: EngineMove[]) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  initialSelectedMoveIds?: number[]; // Pre-select these moves if provided
  showSavedIndicator?: boolean; // Show indicator if moves are from saved selection
}

type SortOption = "power-desc" | "power-asc" | "name" | "accuracy-desc";
type PowerFilter = "all" | "high" | "very-high" | "ultra" | "damaging-only";

export function MoveSelectionScreen({
  availableMoves,
  onConfirm,
  onCancel,
  isLoading = false,
  initialSelectedMoveIds = [],
  showSavedIndicator = false,
}: MoveSelectionScreenProps) {
  const [selectedMoveIds, setSelectedMoveIds] = useState<Set<number>>(
    () => new Set(initialSelectedMoveIds.filter(id => availableMoves.some(m => m.id === id)))
  );
  const [sortBy, setSortBy] = useState<SortOption>("power-desc");
  const [powerFilter, setPowerFilter] = useState<PowerFilter>("all");
  const [damageClassFilter, setDamageClassFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const MAX_SELECTED = 4;

  // Update selected moves when initialSelectedMoveIds or availableMoves change
  useEffect(() => {
    if (initialSelectedMoveIds.length > 0) {
      const validIds = initialSelectedMoveIds.filter(id => availableMoves.some(m => m.id === id));
      if (validIds.length > 0) {
        setSelectedMoveIds(new Set(validIds.slice(0, MAX_SELECTED)));
      }
    }
  }, [initialSelectedMoveIds, availableMoves]);

  // Filter and sort moves
  const filteredAndSortedMoves = useMemo(() => {
    let filtered = [...availableMoves];

    // Apply power filter
    if (powerFilter === "high") {
      filtered = filtered.filter(m => (m.power ?? 0) >= 80);
    } else if (powerFilter === "very-high") {
      filtered = filtered.filter(m => (m.power ?? 0) >= 100);
    } else if (powerFilter === "ultra") {
      filtered = filtered.filter(m => (m.power ?? 0) >= 150);
    } else if (powerFilter === "damaging-only") {
      filtered = filtered.filter(m => (m.power ?? 0) > 0);
    }

    // Apply damage class filter
    if (damageClassFilter !== "all") {
      filtered = filtered.filter(m => m.damage_class.name === damageClassFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => {
        const nameMatch = m.name.toLowerCase().includes(query);
        const powerMatch = m.power?.toString().includes(query);
        // Support ">100" or "> 100" syntax
        const powerComparison = query.match(/>\s*(\d+)/);
        if (powerComparison) {
          const threshold = parseInt(powerComparison[1]);
          return (m.power ?? 0) >= threshold;
        }
        return nameMatch || powerMatch;
      });
    }

    // Sort moves
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "power-desc":
          return (b.power ?? 0) - (a.power ?? 0);
        case "power-asc":
          return (a.power ?? 0) - (b.power ?? 0);
        case "accuracy-desc":
          return (b.accuracy ?? 0) - (a.accuracy ?? 0);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [availableMoves, sortBy, powerFilter, damageClassFilter, searchQuery]);

  const toggleMove = (moveId: number) => {
    const newSelected = new Set(selectedMoveIds);
    if (newSelected.has(moveId)) {
      newSelected.delete(moveId);
    } else {
      if (newSelected.size < MAX_SELECTED) {
        newSelected.add(moveId);
      }
    }
    setSelectedMoveIds(newSelected);
  };

  const handleAutoSelectBest = () => {
    const topMoves = filteredAndSortedMoves
      .filter(move => move.power !== null && move.power > 0)
      .slice(0, 4);
    
    if (topMoves.length > 0) {
      setSelectedMoveIds(new Set(topMoves.map(m => m.id)));
    }
  };

  const handleConfirm = () => {
    if (selectedMoveIds.size !== MAX_SELECTED) return;

    const selectedMoves = availableMoves
      .filter((move) => selectedMoveIds.has(move.id))
      .map((move) => normalizeMoveForBattle(move));

    onConfirm(selectedMoves);
  };

  const getEffectDescription = (move: APIMove): string => {
    // Try to find English effect entry
    const englishEffect = move.effect_entries.find(
      (entry) => entry.language.name === "en"
    );
    
    if (englishEffect) {
      // Prefer short_effect if available, otherwise use effect
      return englishEffect.short_effect || englishEffect.effect;
    }
    
    // Fallback to first available effect
    if (move.effect_entries.length > 0) {
      return move.effect_entries[0].short_effect || move.effect_entries[0].effect;
    }
    
    return "No effect description available.";
  };

  const getDamageClassBadgeColor = (damageClass: string): string => {
    switch (damageClass.toLowerCase()) {
      case "physical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "special":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "status":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getPowerColorClass = (power: number | null): string => {
    if (power === null) return "text-gray-500";
    if (power >= 150) return "text-red-600 font-bold dark:text-red-400";
    if (power >= 100) return "text-orange-600 font-semibold dark:text-orange-400";
    if (power >= 80) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoaderSpinner size="md" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Loading moves...
        </span>
      </div>
    );
  }

  if (availableMoves.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          No moves available for this Pokémon.
        </p>
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Select 4 Moves
        </h2>
        {showSavedIndicator && initialSelectedMoveIds.length > 0 && selectedMoveIds.size === MAX_SELECTED && (
          <p className="mb-2 text-sm text-green-600 dark:text-green-400">
            ✓ Your previous move selection has been restored
          </p>
        )}
        <p className="text-gray-600 dark:text-gray-400">
          {selectedMoveIds.size} / {MAX_SELECTED} moves selected
        </p>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleAutoSelectBest}
          className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
        >
          ⚡ Auto Select Top 4
        </button>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="power-desc">Power: High → Low</option>
          <option value="power-asc">Power: Low → High</option>
          <option value="accuracy-desc">Accuracy: High → Low</option>
          <option value="name">Name: A → Z</option>
        </select>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        {/* Power Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {(["all", "damaging-only", "high", "very-high", "ultra"] as PowerFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setPowerFilter(filter)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all",
                powerFilter === filter
                  ? "bg-blue-500 text-white dark:bg-blue-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              )}
            >
              {filter === "all" && "All"}
              {filter === "damaging-only" && "⚔️ Damaging"}
              {filter === "high" && "🔥 ≥80 Power"}
              {filter === "very-high" && "💥 ≥100 Power"}
              {filter === "ultra" && "✨ ≥150 Power"}
            </button>
          ))}
        </div>

        {/* Damage Class Filter */}
        <select
          value={damageClassFilter}
          onChange={(e) => setDamageClassFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="all">All Damage Classes</option>
          <option value="physical">Physical Only</option>
          <option value="special">Special Only</option>
          <option value="status">Status Only</option>
        </select>

        {/* Search Bar */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, power (e.g., '150' or '>100')..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredAndSortedMoves.length} of {availableMoves.length} moves
      </p>

      {/* Moves Carousel/Gallery */}
      <div className="w-full">
        {/* Scrollable container */}
        <div 
          className="flex gap-4 overflow-x-auto pb-4"
          style={{ 
            scrollbarWidth: 'thin', 
            scrollbarColor: 'rgb(209 213 219) transparent' 
          }}
        >
          <AnimatePresence>
            {filteredAndSortedMoves.map((move) => {
              const isSelected = selectedMoveIds.has(move.id);
              const isFull = selectedMoveIds.size >= MAX_SELECTED && !isSelected;

              return (
                <motion.div
                  key={move.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={!isFull ? { scale: 1.02, y: -4 } : {}}
                  whileTap={!isFull ? { scale: 0.98 } : {}}
                  onClick={() => !isFull && toggleMove(move.id)}
                  className={cn(
                    "flex-shrink-0 cursor-pointer rounded-lg border-2 p-4 transition-all",
                    "w-[280px] min-w-[280px]", // Fixed width for consistent card size
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md dark:border-blue-400 dark:bg-blue-900/20"
                      : isFull
                      ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-800"
                      : "border-gray-300 bg-white hover:border-blue-400 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-500"
                  )}
                >
                  {/* Header: Name and Type */}
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="font-bold capitalize text-gray-900 dark:text-gray-100">
                      {move.name}
                    </h3>
                    <Badge variant="type" typeName={move.type.name}>
                      {move.type.name}
                    </Badge>
                  </div>

                  {/* Stats Row - Power highlighted */}
                  <div className="mb-2 flex flex-wrap gap-2 text-xs">
                    {move.power !== null && (
                      <span className={cn("font-semibold", getPowerColorClass(move.power))}>
                        Power: <span className="text-lg">{move.power}</span>
                      </span>
                    )}
                    {move.accuracy !== null && (
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Acc:</span> {move.accuracy}%
                      </span>
                    )}
                    {move.pp !== null && (
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">PP:</span> {move.pp}
                      </span>
                    )}
                    {move.priority !== 0 && (
                      <span className="text-blue-600 dark:text-blue-400">
                        <span className="font-semibold">Priority:</span>{" "}
                        {move.priority > 0 ? "+" : ""}
                        {move.priority}
                      </span>
                    )}
                  </div>

                  {/* Damage Class Badge */}
                  <div className="mb-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        getDamageClassBadgeColor(move.damage_class.name)
                      )}
                    >
                      {move.damage_class.name.charAt(0).toUpperCase() +
                        move.damage_class.name.slice(1)}
                    </span>
                  </div>

                  {/* Effect Description */}
                  <p className="mb-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                    {getEffectDescription(move)}
                  </p>

                  {/* Selection Indicator */}
                  <div className="mt-2 flex items-center justify-end">
                    {isSelected ? (
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        ✓ Selected
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Click to select
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleConfirm}
          disabled={selectedMoveIds.size !== MAX_SELECTED || isLoading}
          className={cn(
            "rounded-lg px-6 py-2 font-medium text-white transition-all",
            selectedMoveIds.size === MAX_SELECTED && !isLoading
              ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              : "cursor-not-allowed bg-gray-400 opacity-50 dark:bg-gray-600"
          )}
        >
          {isLoading ? (
            <>
              <LoaderSpinner size="sm" />
              <span className="ml-2">Confirming...</span>
            </>
          ) : (
            `Confirm Selection (${selectedMoveIds.size}/${MAX_SELECTED})`
          )}
        </button>
      </div>
    </div>
  );
}

