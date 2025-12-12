"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getPokemonEncounters } from "@/lib/api/encounters";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import type { PokemonEncounter } from "@/types/api";

interface EncounterLocationsProps {
  pokemonId: number;
}

export function EncounterLocations({ pokemonId }: EncounterLocationsProps) {
  const [encounters, setEncounters] = useState<PokemonEncounter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEncounters = async () => {
      try {
        const data = await getPokemonEncounters(pokemonId);
        setEncounters(data);
      } catch (error) {
        console.error("Error fetching encounters:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEncounters();
  }, [pokemonId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoaderSpinner size="lg" />
      </div>
    );
  }

  if (encounters.length === 0) {
    return (
      <p className="text-center text-gray-600 dark:text-gray-400">
        No encounter locations available
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {encounters.map((encounter, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800"
        >
          <h4 className="mb-2 font-semibold capitalize text-gray-900 dark:text-gray-100">
            {encounter.location_area.name.replace(/-/g, " ")}
          </h4>
          <div className="space-y-2">
            {encounter.version_details.map((versionDetail) => (
              <div key={versionDetail.version.name} className="text-sm">
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {versionDetail.version.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Max chance: {versionDetail.max_chance}%
                </p>
                <div className="mt-1 space-y-1">
                  {versionDetail.encounter_details.map((detail, idx) => (
                    <p key={idx} className="text-xs text-gray-500 dark:text-gray-500">
                      {detail.method.name.replace(/-/g, " ")} (Lv. {detail.min_level}
                      -{detail.max_level}, {detail.chance}%)
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

