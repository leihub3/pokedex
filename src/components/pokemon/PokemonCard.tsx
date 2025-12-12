"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import type { Pokemon } from "@/types/api";

interface PokemonCardProps {
  pokemon: Pokemon;
  index?: number;
}

export function PokemonCard({ pokemon, index = 0 }: PokemonCardProps) {
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
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link href={`/pokemon/${pokemon.id}`}>
        <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative h-24 w-24">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={formattedName}
                  fill
                  className="object-contain transition-transform group-hover:scale-110"
                  sizes="96px"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                  <span className="text-2xl">?</span>
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formattedName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
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
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

