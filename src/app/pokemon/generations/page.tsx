import { Suspense } from "react";
import { getGenerationList } from "@/lib/api/generations";
import { GenerationsExplorerClient } from "@/components/pokemon/GenerationsExplorerClient";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";

async function getGenerationsData() {
  try {
    const response = await getGenerationList();
    return response;
  } catch (error) {
    console.error("Error fetching generations:", error);
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export default async function GenerationsExplorerPage() {
  const initialData = await getGenerationsData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            Generations Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore Pokémon by generation
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <LoaderSpinner size="lg" />
            </div>
          }
        >
          <GenerationsExplorerClient initialData={initialData} />
        </Suspense>
      </div>
    </div>
  );
}

