"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getAbilityList, getAbilityById } from "@/lib/api/abilities";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { fadeIn, staggerContainer, staggerItem } from "@/lib/utils/animations";
import type { AbilityListResponse, Ability } from "@/types/api";

interface AbilitiesExplorerClientProps {
  initialData: AbilityListResponse;
}

export function AbilitiesExplorerClient({
  initialData,
}: AbilitiesExplorerClientProps) {
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAbilities = async () => {
      setIsLoading(true);
      try {
        const abilityDetails = await Promise.all(
          initialData.results.slice(0, 50).map(async (abilityItem) => {
            const match = abilityItem.url.match(/\/ability\/(\d+)\//);
            if (match) {
              return getAbilityById(parseInt(match[1], 10));
            }
            return null;
          })
        );
        setAbilities(
          abilityDetails.filter((ability): ability is Ability => ability !== null)
        );
      } catch (error) {
        console.error("Error fetching ability details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAbilities();
  }, [initialData]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoaderSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {abilities.map((ability) => {
        const englishEffect = ability.effect_entries.find(
          (entry) => entry.language.name === "en"
        );

        return (
          <motion.div
            key={ability.id}
            variants={staggerItem}
            whileHover={{ scale: 1.02, y: -4 }}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-800"
          >
            <Link href={`/pokemon/abilities/${ability.id}`}>
              <h3 className="mb-2 text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
                {ability.name.replace(/-/g, " ")}
              </h3>
              {englishEffect?.short_effect && (
                <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {englishEffect.short_effect}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {ability.pokemon.length} Pokémon
              </p>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

