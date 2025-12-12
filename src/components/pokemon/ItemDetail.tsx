"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Item } from "@/types/api";

interface ItemDetailProps {
  item: Item;
}

export function ItemDetail({ item }: ItemDetailProps) {
  const englishEffect = item.effect_entries.find(
    (entry) => entry.language.name === "en"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-6">
        {item.sprites.default && (
          <div className="relative h-24 w-24">
            <Image
              src={item.sprites.default}
              alt={item.name}
              fill
              className="object-contain"
              sizes="96px"
            />
          </div>
        )}
        <div>
          <h1 className="mb-2 text-4xl font-bold capitalize text-gray-900 dark:text-gray-100">
            {item.name.replace(/-/g, " ")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {item.cost} ₽
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Information
          </h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Category</dt>
              <dd className="font-medium capitalize text-gray-900 dark:text-gray-100">
                {item.category.name.replace(/-/g, " ")}
              </dd>
            </div>
            {item.attributes.length > 0 && (
              <div>
                <dt className="mb-2 text-gray-600 dark:text-gray-400">
                  Attributes
                </dt>
                <dd className="space-y-1">
                  {item.attributes.map((attr) => (
                    <span
                      key={attr.name}
                      className="mr-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs capitalize text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {attr.name.replace(/-/g, " ")}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {englishEffect && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Effect
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {englishEffect.short_effect || englishEffect.effect}
            </p>
          </div>
        )}
      </div>

      {item.held_by_pokemon.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Held by ({item.held_by_pokemon.length} Pokémon)
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {item.held_by_pokemon.slice(0, 24).map((pokemonEntry) => {
              const pokemonId = pokemonEntry.pokemon.url.match(/\/pokemon\/(\d+)\//)?.[1];
              return (
                <Link
                  key={pokemonEntry.pokemon.name}
                  href={`/pokemon/${pokemonId}`}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-center text-sm capitalize transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  {pokemonEntry.pokemon.name.replace(/-/g, " ")}
                </Link>
              );
            })}
          </div>
          {item.held_by_pokemon.length > 24 && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              And {item.held_by_pokemon.length - 24} more...
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

