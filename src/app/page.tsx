import { Suspense } from "react";
import { getPokemonList } from "@/lib/api/pokemon";
import { PokemonListClient } from "@/components/pokemon/PokemonListClient";
import { PokemonCardSkeleton } from "@/components/ui/Skeleton";

async function getInitialPokemon() {
  try {
    const response = await getPokemonList(0, 20);
    return response;
  } catch (error) {
    console.error("Error fetching initial Pokemon:", error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }
}

export default async function HomePage() {
  const initialData = await getInitialPokemon();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            Pokémon Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and explore your favorite Pokémon
          </p>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PokemonCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <PokemonListClient initialData={initialData} />
        </Suspense>
      </div>
    </div>
  );
}
