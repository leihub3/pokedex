import { Suspense } from "react";
import { getItemList } from "@/lib/api/items";
import { ItemsExplorerClient } from "@/components/pokemon/ItemsExplorerClient";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";

async function getItemsData() {
  try {
    const response = await getItemList(0, 100);
    return response;
  } catch (error) {
    console.error("Error fetching items:", error);
    return { count: 0, next: null, previous: null, results: [] };
  }
}

export default async function ItemsExplorerPage() {
  const initialData = await getItemsData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            Items Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse all Pokémon items
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <LoaderSpinner size="lg" />
            </div>
          }
        >
          <ItemsExplorerClient initialData={initialData} />
        </Suspense>
      </div>
    </div>
  );
}

