/**
 * Type color mapping for Pokémon types
 * Colors are optimized for both light and dark modes
 */
export const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  normal: {
    bg: "bg-gray-400 dark:bg-gray-500",
    text: "text-gray-900 dark:text-gray-100",
    border: "border-gray-500 dark:border-gray-400",
  },
  fire: {
    bg: "bg-red-500 dark:bg-red-600",
    text: "text-white",
    border: "border-red-600 dark:border-red-500",
  },
  water: {
    bg: "bg-blue-500 dark:bg-blue-600",
    text: "text-white",
    border: "border-blue-600 dark:border-blue-500",
  },
  electric: {
    bg: "bg-yellow-400 dark:bg-yellow-500",
    text: "text-gray-900 dark:text-gray-900",
    border: "border-yellow-500 dark:border-yellow-400",
  },
  grass: {
    bg: "bg-green-500 dark:bg-green-600",
    text: "text-white",
    border: "border-green-600 dark:border-green-500",
  },
  ice: {
    bg: "bg-cyan-300 dark:bg-cyan-400",
    text: "text-gray-900 dark:text-gray-900",
    border: "border-cyan-400 dark:border-cyan-300",
  },
  fighting: {
    bg: "bg-orange-600 dark:bg-orange-700",
    text: "text-white",
    border: "border-orange-700 dark:border-orange-600",
  },
  poison: {
    bg: "bg-purple-500 dark:bg-purple-600",
    text: "text-white",
    border: "border-purple-600 dark:border-purple-500",
  },
  ground: {
    bg: "bg-amber-600 dark:bg-amber-700",
    text: "text-white",
    border: "border-amber-700 dark:border-amber-600",
  },
  flying: {
    bg: "bg-indigo-400 dark:bg-indigo-500",
    text: "text-white",
    border: "border-indigo-500 dark:border-indigo-400",
  },
  psychic: {
    bg: "bg-pink-500 dark:bg-pink-600",
    text: "text-white",
    border: "border-pink-600 dark:border-pink-500",
  },
  bug: {
    bg: "bg-lime-500 dark:bg-lime-600",
    text: "text-white",
    border: "border-lime-600 dark:border-lime-500",
  },
  rock: {
    bg: "bg-stone-600 dark:bg-stone-700",
    text: "text-white",
    border: "border-stone-700 dark:border-stone-600",
  },
  ghost: {
    bg: "bg-violet-600 dark:bg-violet-700",
    text: "text-white",
    border: "border-violet-700 dark:border-violet-600",
  },
  dragon: {
    bg: "bg-indigo-600 dark:bg-indigo-700",
    text: "text-white",
    border: "border-indigo-700 dark:border-indigo-600",
  },
  dark: {
    bg: "bg-gray-700 dark:bg-gray-800",
    text: "text-white",
    border: "border-gray-800 dark:border-gray-700",
  },
  steel: {
    bg: "bg-slate-500 dark:bg-slate-600",
    text: "text-white",
    border: "border-slate-600 dark:border-slate-500",
  },
  fairy: {
    bg: "bg-pink-300 dark:bg-pink-400",
    text: "text-gray-900 dark:text-gray-900",
    border: "border-pink-400 dark:border-pink-300",
  },
};

/**
 * Get color classes for a type
 */
export function getTypeColor(typeName: string) {
  return typeColors[typeName.toLowerCase()] || typeColors.normal;
}

