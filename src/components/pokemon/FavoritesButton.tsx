"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFavoritesStore } from "@/store/favoritesStore";
import { cardFlip } from "@/lib/utils/animations";

interface FavoritesButtonProps {
  pokemonId: number;
  className?: string;
}

export function FavoritesButton({
  pokemonId,
  className = "",
}: FavoritesButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [isFlipping, setIsFlipping] = useState(false);
  const favorite = isFavorite(pokemonId);

  const handleClick = () => {
    setIsFlipping(true);
    setTimeout(() => {
      toggleFavorite(pokemonId);
      setIsFlipping(false);
    }, 300);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`relative h-8 w-8 ${className}`}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
    >
      <AnimatePresence mode="wait">
        {favorite ? (
          <motion.svg
            key="filled"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full fill-red-500 text-red-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </motion.svg>
        ) : (
          <motion.svg
            key="outline"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full text-gray-400 hover:text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

