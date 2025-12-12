"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionTabs } from "@/components/layout/SectionTabs";
import { StatsChart } from "./StatsChart";
import { AbilitiesList } from "./AbilitiesList";
import { MovesList } from "./MovesList";
import { EvolutionTree } from "./EvolutionTree";
import { EncounterLocations } from "./EncounterLocations";
import { SpeciesInfo } from "./SpeciesInfo";
import { PokemonSpriteCarousel } from "./PokemonSpriteCarousel";
import { FavoritesButton } from "./FavoritesButton";
import type { Pokemon, Species } from "@/types/api";

interface PokemonDetailProps {
  pokemon: Pokemon;
  species: Species;
}

export function PokemonDetail({ pokemon, species }: PokemonDetailProps) {
  const imageUrl =
    pokemon.sprites.other["official-artwork"].front_default ||
    pokemon.sprites.front_default ||
    "";

  const formattedName =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-6">
        <Link href="/">
          <Button variant="outline" size="sm">
            ← Back to List
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header Section with Parallax Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex flex-col items-center space-y-4 rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 dark:border-gray-700"
        >
          {/* Favorites Button */}
          <div className="absolute right-4 top-4">
            <FavoritesButton pokemonId={pokemon.id} />
          </div>
          <div className="relative h-64 w-64">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={formattedName}
                fill
                className="object-contain"
                sizes="256px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <span className="text-6xl">?</span>
              </div>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {formattedName}
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
              #{String(pokemon.id).padStart(3, "0")}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {pokemon.types.map((typeSlot) => (
              <Badge
                key={typeSlot.slot}
                variant="type"
                typeName={typeSlot.type.name}
              >
                {typeSlot.type.name}
              </Badge>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Height</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {pokemon.height / 10}m
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {pokemon.weight / 10}kg
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Base Exp
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {pokemon.base_experience}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section Navigation */}
        <SectionTabs
          sections={[
            { id: "sprites", label: "Sprites" },
            { id: "stats", label: "Stats" },
            { id: "abilities", label: "Abilities" },
            { id: "moves", label: "Moves" },
            { id: "evolution", label: "Evolution" },
            { id: "encounters", label: "Encounters" },
            { id: "species", label: "Species Info" },
          ]}
        />

        {/* Sprites */}
        <section id="sprites" className="scroll-mt-24">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <PokemonSpriteCarousel pokemon={pokemon} />
          </div>
        </section>

        {/* Stats Chart */}
        <section id="stats" className="scroll-mt-24">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <StatsChart pokemon={pokemon} />
          </div>
        </section>

        {/* Abilities */}
        <section id="abilities" className="scroll-mt-24">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <AbilitiesList pokemon={pokemon} />
          </div>
        </section>

        {/* Moves */}
        <section id="moves" className="scroll-mt-24">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <MovesList pokemon={pokemon} />
          </div>
        </section>

        {/* Evolution Chain */}
        <section id="evolution" className="scroll-mt-24">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Evolution Chain
            </h2>
            <EvolutionTree
              speciesUrl={species.evolution_chain.url}
              currentPokemonId={pokemon.id}
            />
          </div>
        </section>

        {/* Encounter Locations */}
        <section id="encounters" className="scroll-mt-24">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Encounter Locations
            </h2>
            <EncounterLocations pokemonId={pokemon.id} />
          </div>
        </section>

        {/* Species Info */}
        <section id="species" className="scroll-mt-24">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Species Information
            </h2>
            <SpeciesInfo speciesId={species.id} />
          </div>
        </section>
      </div>
    </motion.div>
  );
}

