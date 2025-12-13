"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import type { Move as EngineMove } from "@/battle-engine";
import type { ActivePokemon } from "@/battle-engine";
interface MoveSelectorProps {
  moves: EngineMove[];
  pokemonIndex: 0 | 1;
  activePokemon: ActivePokemon | null;
  onMoveSelect: (moveIndex: number) => void;
  disabled?: boolean;
}

export function MoveSelector({
  moves,
  pokemonIndex,
  activePokemon,
  onMoveSelect,
  disabled = false,
}: MoveSelectorProps) {
  // Check if Pokemon can act (sleep prevents actions)
  // Note: Paralysis has a chance component that engine handles, so we don't block it in UI
  const canPokemonAct =
    activePokemon &&
    (activePokemon.status === null ||
      activePokemon.status.type !== "sleep" ||
      (activePokemon.status.type === "sleep" &&
        activePokemon.status.turnsRemaining === 0));

  const isDisabled = disabled || !activePokemon || !canPokemonAct || moves.length === 0;

  if (moves.length === 0) {
    return (
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        No moves available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {moves.map((move, index) => {
        const isDamaging = move.power !== null && move.power > 0;
        const moveDisabled = isDisabled;

        return (
          <motion.button
            key={move.id}
            whileHover={!moveDisabled ? { scale: 1.02 } : {}}
            whileTap={!moveDisabled ? { scale: 0.98 } : {}}
            onClick={() => !moveDisabled && onMoveSelect(index)}
            disabled={moveDisabled}
            className={`rounded-lg border-2 p-3 text-left transition-all ${
              moveDisabled
                ? "cursor-not-allowed border-gray-200 bg-gray-100 opacity-50 dark:border-gray-700 dark:bg-gray-800"
                : "border-gray-300 bg-white hover:border-blue-500 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-400"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold capitalize text-gray-900 dark:text-gray-100">
                    {move.name}
                  </span>
                  <Badge variant="type" typeName={move.type}>
                    {move.type}
                  </Badge>
                </div>
                <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                  {isDamaging && move.power && (
                    <span>Power: {move.power}</span>
                  )}
                  {move.accuracy && (
                    <span>Acc: {move.accuracy}%</span>
                  )}
                  {move.priority !== 0 && (
                    <span className="text-blue-600 dark:text-blue-400">
                      Prio: {move.priority > 0 ? "+" : ""}
                      {move.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

