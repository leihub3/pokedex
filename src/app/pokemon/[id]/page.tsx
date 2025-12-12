import { Suspense } from "react";
import { getPokemonById } from "@/lib/api/pokemon";
import { getSpeciesById } from "@/lib/api/species";
import { PokemonDetail } from "@/components/pokemon/PokemonDetail";
import { PokemonDetailSkeleton } from "@/components/ui/Skeleton";
import { notFound } from "next/navigation";

interface PokemonDetailPageProps {
  params: Promise<{ id: string }>;
}

// Generate static params for first 151 Pokemon (Gen 1)
export async function generateStaticParams() {
  const pokemonIds = Array.from({ length: 151 }, (_, i) => i + 1);
  return pokemonIds.map((id) => ({
    id: id.toString(),
  }));
}

async function getPokemonData(id: string) {
  try {
    const pokemon = await getPokemonById(id);
    const species = await getSpeciesById(pokemon.id);
    return { pokemon, species };
  } catch (error) {
    console.error("Error fetching Pokemon:", error);
    return null;
  }
}

export default async function PokemonDetailPage({
  params,
}: PokemonDetailPageProps) {
  const { id } = await params;
  const data = await getPokemonData(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<PokemonDetailSkeleton />}>
        <PokemonDetail pokemon={data.pokemon} species={data.species} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PokemonDetailPageProps) {
  const { id } = await params;
  const data = await getPokemonData(id);

  if (!data) {
    return {
      title: "Pokémon Not Found",
    };
  }

  const formattedName =
    data.pokemon.name.charAt(0).toUpperCase() + data.pokemon.name.slice(1);

  return {
    title: `${formattedName} - Pokémon Explorer`,
    description: `View details for ${formattedName}, including stats, abilities, and moves.`,
  };
}

