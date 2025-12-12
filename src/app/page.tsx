import { Suspense } from "react";
import { getPokemonList } from "@/lib/api/pokemon";
import { PokemonListClient } from "@/components/pokemon/PokemonListClient";
import { PokemonCardSkeleton } from "@/components/ui/Skeleton";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";

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
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      
      <div className="container mx-auto px-4 py-12" id="pokemon">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
            Discover Pokémon
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Browse through all available Pokémon
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
