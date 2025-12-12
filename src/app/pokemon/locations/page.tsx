import { Suspense } from "react";
import { getRegionList } from "@/lib/api/locations";
import { LocationsExplorerClient } from "@/components/pokemon/LocationsExplorerClient";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";

async function getRegionsData() {
  try {
    const response = await getRegionList();
    return response;
  } catch (error) {
    console.error("Error fetching regions:", error);
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export default async function LocationsExplorerPage() {
  const initialData = await getRegionsData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            Locations Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore Pokémon regions and locations
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <LoaderSpinner size="lg" />
            </div>
          }
        >
          <LocationsExplorerClient initialData={initialData} />
        </Suspense>
      </div>
    </div>
  );
}

