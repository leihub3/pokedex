import { Suspense } from "react";
import { getPokemonTypes } from "@/lib/api/pokemon";
import { TypeExplorerClient } from "@/components/pokemon/TypeExplorerClient";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";

async function getTypesData() {
  try {
    const types = await getPokemonTypes();
    return types;
  } catch (error) {
    console.error("Error fetching types:", error);
    return [];
  }
}

export default async function TypeExplorerPage() {
  const types = await getTypesData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            Type Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore Pokémon types and their effectiveness
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <LoaderSpinner size="lg" />
            </div>
          }
        >
          <TypeExplorerClient initialTypes={types} />
        </Suspense>
      </div>
    </div>
  );
}

