"use client";

import { usePokemonStore } from "@/store/pokemonStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const ALL_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

export function TypeFilter() {
  const selectedTypes = usePokemonStore((state) => state.selectedTypes);
  const toggleType = usePokemonStore((state) => state.toggleType);
  const resetFilters = usePokemonStore((state) => state.resetFilters);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Filter by Type
        </h3>
        {selectedTypes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs"
          >
            Clear
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {ALL_TYPES.map((type) => {
          const isSelected = selectedTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className="transition-transform hover:scale-105 active:scale-95"
            >
              <Badge
                variant="type"
                typeName={type}
                className={
                  isSelected
                    ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800"
                    : "opacity-60 hover:opacity-100"
                }
              >
                {type}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}

