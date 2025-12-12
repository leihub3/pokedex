import { Suspense } from "react";
import { getMoveList } from "@/lib/api/moves";
import { MovesExplorerClient } from "@/components/pokemon/MovesExplorerClient";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";

async function getMovesData() {
  try {
    const response = await getMoveList(0, 100);
    return response;
  } catch (error) {
    console.error("Error fetching moves:", error);
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export default async function MovesExplorerPage() {
  const initialData = await getMovesData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            Move Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and search through all Pokémon moves
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <LoaderSpinner size="lg" />
            </div>
          }
        >
          <MovesExplorerClient initialData={initialData} />
        </Suspense>
      </div>
    </div>
  );
}

