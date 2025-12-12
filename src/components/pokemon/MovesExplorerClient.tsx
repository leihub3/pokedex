"use client";

import { useEffect, useState } from "react";
import { getMoveList, getMoveById } from "@/lib/api/moves";
import { MoveTable } from "@/components/ui/MoveTable";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import type { MoveListResponse, Move } from "@/types/api";

interface MovesExplorerClientProps {
  initialData: MoveListResponse;
}

export function MovesExplorerClient({ initialData }: MovesExplorerClientProps) {
  const [moves, setMoves] = useState<Move[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMoves = async () => {
      setIsLoading(true);
      try {
        // Fetch first batch of moves
        const moveDetails = await Promise.all(
          initialData.results.slice(0, 50).map(async (moveItem) => {
            const match = moveItem.url.match(/\/move\/(\d+)\//);
            if (match) {
              return getMoveById(parseInt(match[1], 10));
            }
            return null;
          })
        );
        setMoves(moveDetails.filter((move): move is Move => move !== null));
      } catch (error) {
        console.error("Error fetching move details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoves();
  }, [initialData]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoaderSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MoveTable moves={moves} />
    </div>
  );
}

