"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { Pokemon } from "@/types/api";

interface PokemonSpriteCarouselProps {
  pokemon: Pokemon;
}

export function PokemonSpriteCarousel({ pokemon }: PokemonSpriteCarouselProps) {
  const sprites = [
    { name: "Default", url: pokemon.sprites.front_default },
    { name: "Shiny", url: pokemon.sprites.front_shiny },
    {
      name: "Official Artwork",
      url: pokemon.sprites.other["official-artwork"].front_default,
    },
    {
      name: "Official Artwork Shiny",
      url: pokemon.sprites.other["official-artwork"].front_shiny,
    },
  ].filter((sprite) => sprite.url);

  const [currentIndex, setCurrentIndex] = useState(0);

  if (sprites.length === 0) {
    return null;
  }

  const nextSprite = () => {
    setCurrentIndex((prev) => (prev + 1) % sprites.length);
  };

  const prevSprite = () => {
    setCurrentIndex((prev) => (prev - 1 + sprites.length) % sprites.length);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Sprites
      </h3>
      <div className="relative flex items-center justify-center">
        <button
          onClick={prevSprite}
          className="absolute left-0 rounded-lg bg-white p-2 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Previous sprite"
        >
          ←
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="relative h-64 w-64"
          >
            {sprites[currentIndex]?.url && (
              <Image
                src={sprites[currentIndex].url}
                alt={`${pokemon.name} ${sprites[currentIndex].name}`}
                fill
                className="object-contain"
                sizes="256px"
              />
            )}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={nextSprite}
          className="absolute right-0 rounded-lg bg-white p-2 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Next sprite"
        >
          →
        </button>
      </div>

      <div className="flex justify-center gap-2">
        {sprites.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === currentIndex
                ? "bg-blue-600 dark:bg-blue-400"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
            aria-label={`Go to sprite ${index + 1}`}
          />
        ))}
      </div>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {sprites[currentIndex]?.name}
      </p>
    </div>
  );
}

