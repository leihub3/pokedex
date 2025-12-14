"use client";

import { useState } from "react";
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
}

export function MoveSelectionScreen({
  availableMoves,
  onConfirm,
  onCancel,
  isLoading = false,
}: MoveSelectionScreenProps) {
  const [selectedMoveIds, setSelectedMoveIds] = useState<Set<number>>(new Set());
  const MAX_SELECTED = 4;

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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Select 4 Moves
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {selectedMoveIds.size} / {MAX_SELECTED} moves selected
        </p>
      </div>

      {/* Moves Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {availableMoves.map((move) => {
            const isSelected = selectedMoveIds.has(move.id);
            const isFull = selectedMoveIds.size >= MAX_SELECTED && !isSelected;

            return (
              <motion.div
                key={move.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={!isFull ? { scale: 1.02 } : {}}
                whileTap={!isFull ? { scale: 0.98 } : {}}
                onClick={() => !isFull && toggleMove(move.id)}
                className={cn(
                  "cursor-pointer rounded-lg border-2 p-4 transition-all",
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

                {/* Stats Row */}
                <div className="mb-2 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                  {move.power !== null && (
                    <span>
                      <span className="font-semibold">Power:</span> {move.power}
                    </span>
                  )}
                  {move.accuracy !== null && (
                    <span>
                      <span className="font-semibold">Acc:</span> {move.accuracy}%
                    </span>
                  )}
                  {move.pp !== null && (
                    <span>
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
                <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
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

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
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

