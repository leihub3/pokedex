"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { getEvolutionChainFromSpecies, getPokemonById } from "@/lib/api";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { Badge } from "@/components/ui/Badge";
import type { EvolutionChain, Pokemon } from "@/types/api";

interface EvolutionTreeProps {
  speciesUrl: string;
  currentPokemonId: number;
}

interface EvolutionNode {
  species: { name: string; url: string };
  evolutionDetails: any[];
  evolvesTo: EvolutionNode[];
}

function EvolutionNodeComponent({
  node,
  currentPokemonId,
}: {
  node: EvolutionNode;
  currentPokemonId: number;
}) {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const match = node.species.url.match(/\/pokemon-species\/(\d+)\//);
        if (match) {
          const pokemonId = parseInt(match[1], 10);
          const data = await getPokemonById(pokemonId);
          setPokemon(data);
        }
      } catch (error) {
        console.error("Error fetching pokemon:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemon();
  }, [node.species.url]);

  if (isLoading) {
    return <LoaderSpinner size="sm" />;
  }

  if (!pokemon) return null;

  const isCurrent = pokemon.id === currentPokemonId;
  const imageUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default ||
    "";

  return (
    <div className="flex flex-col items-center">
      <Link
        href={`/pokemon/${pokemon.id}`}
        className={`group relative ${isCurrent ? "ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
      >
        <motion.div
          whileHover={{ scale: 1.1, y: -4 }}
          className="rounded-lg border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          {imageUrl && (
            <div className="relative h-24 w-24">
              <Image
                src={imageUrl}
                alt={pokemon.name}
                fill
                className="object-contain"
                sizes="96px"
              />
            </div>
          )}
          <p className="mt-2 text-center text-sm font-medium capitalize text-gray-900 dark:text-gray-100">
            {pokemon.name}
          </p>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            #{String(pokemon.id).padStart(3, "0")}
          </p>
        </motion.div>
      </Link>

      {node.evolutionDetails.length > 0 && (
        <div className="mt-2 text-center text-xs text-gray-600 dark:text-gray-400">
          {node.evolutionDetails[0]?.trigger?.name && (
            <span className="capitalize">
              {node.evolutionDetails[0].trigger.name.replace(/-/g, " ")}
            </span>
          )}
          {node.evolutionDetails[0]?.min_level && (
            <span> Lv. {node.evolutionDetails[0].min_level}</span>
          )}
        </div>
      )}

      {node.evolvesTo.length > 0 && (
        <div className="mt-4 flex gap-4">
          {node.evolvesTo.map((child, index) => (
            <div key={index} className="flex items-start">
              <div className="flex flex-col items-center">
                <div className="h-8 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                <EvolutionNodeComponent
                  node={child}
                  currentPokemonId={currentPokemonId}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EvolutionTree({
  speciesUrl,
  currentPokemonId,
}: EvolutionTreeProps) {
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvolutionChain = async () => {
      try {
        const chain = await getEvolutionChainFromSpecies(speciesUrl);
        setEvolutionChain(chain);
      } catch (error) {
        console.error("Error fetching evolution chain:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvolutionChain();
  }, [speciesUrl]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoaderSpinner size="lg" />
      </div>
    );
  }

  if (!evolutionChain) {
    return (
      <p className="text-center text-gray-600 dark:text-gray-400">
        No evolution chain available
      </p>
    );
  }

  const rootNode: EvolutionNode = {
    species: evolutionChain.chain.species,
    evolutionDetails: evolutionChain.chain.evolution_details,
    evolvesTo: evolutionChain.chain.evolves_to.map((child) => ({
      species: child.species,
      evolutionDetails: child.evolution_details,
      evolvesTo: child.evolves_to.map((grandchild) => ({
        species: grandchild.species,
        evolutionDetails: grandchild.evolution_details,
        evolvesTo: [],
      })),
    })),
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-center">
        <EvolutionNodeComponent
          node={rootNode}
          currentPokemonId={currentPokemonId}
        />
      </div>
    </div>
  );
}

