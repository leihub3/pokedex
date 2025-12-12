"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSpeciesById } from "@/lib/api/species";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import type { Species } from "@/types/api";

interface SpeciesInfoProps {
  speciesId: number;
}

export function SpeciesInfo({ speciesId }: SpeciesInfoProps) {
  const [species, setSpecies] = useState<Species | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const data = await getSpeciesById(speciesId);
        setSpecies(data);
      } catch (error) {
        console.error("Error fetching species:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpecies();
  }, [speciesId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoaderSpinner size="lg" />
      </div>
    );
  }

  if (!species) {
    return (
      <p className="text-center text-gray-600 dark:text-gray-400">
        No species information available
      </p>
    );
  }

  const englishFlavorText = species.flavor_text_entries.find(
    (entry) => entry.language.name === "en"
  );

  return (
    <div className="space-y-4">
      {englishFlavorText && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
          <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            Description
          </h4>
          <p className="text-gray-700 dark:text-gray-300">
            {englishFlavorText.flavor_text.replace(/\f/g, " ")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
          <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            Growth Rate
          </h4>
          <p className="capitalize text-gray-700 dark:text-gray-300">
            {species.growth_rate.name.replace(/-/g, " ")}
          </p>
        </div>

        {species.habitat && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
            <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
              Habitat
            </h4>
            <p className="capitalize text-gray-700 dark:text-gray-300">
              {species.habitat.name.replace(/-/g, " ")}
            </p>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
          <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            Shape
          </h4>
          <p className="capitalize text-gray-700 dark:text-gray-300">
            {species.shape.name.replace(/-/g, " ")}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
          <h4 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            Color
          </h4>
          <p className="capitalize text-gray-700 dark:text-gray-300">
            {species.color.name.replace(/-/g, " ")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {species.is_legendary && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            Legendary
          </span>
        )}
        {species.is_mythical && (
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            Mythical
          </span>
        )}
        {species.is_baby && (
          <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
            Baby
          </span>
        )}
      </div>
    </div>
  );
}

