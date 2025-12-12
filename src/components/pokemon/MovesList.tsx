"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Pokemon } from "@/types/api";

interface MovesListProps {
  pokemon: Pokemon;
}

export function MovesList({ pokemon }: MovesListProps) {
  const [showAll, setShowAll] = useState(false);
  const displayLimit = 20;

  const formatMoveName = (name: string) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const movesToShow = showAll
    ? pokemon.moves
    : pokemon.moves.slice(0, displayLimit);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Moves ({pokemon.moves.length})
        </h3>
        {pokemon.moves.length > displayLimit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : "Show All"}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {movesToShow.map((move, index) => (
          <Badge key={index} variant="default">
            {formatMoveName(move.move.name)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

