"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getRegionById, getLocationById, getLocationAreaById } from "@/lib/api/locations";
import { LoaderSpinner } from "@/components/ui/LoaderSpinner";
import { staggerContainer, staggerItem } from "@/lib/utils/animations";
import type { RegionListResponse, Region, Location, LocationArea } from "@/types/api";

interface LocationsExplorerClientProps {
  initialData: RegionListResponse;
}

type NavigationLevel = "regions" | "locations" | "areas" | "encounters";

export function LocationsExplorerClient({
  initialData,
}: LocationsExplorerClientProps) {
  const [currentLevel, setCurrentLevel] = useState<NavigationLevel>("regions");
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedArea, setSelectedArea] = useState<LocationArea | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegionClick = async (regionUrl: string) => {
    setIsLoading(true);
    try {
      const match = regionUrl.match(/\/region\/(\d+)\//);
      if (match) {
        const region = await getRegionById(parseInt(match[1], 10));
        setSelectedRegion(region);
        setCurrentLevel("locations");
      }
    } catch (error) {
      console.error("Error fetching region:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationClick = async (locationUrl: string) => {
    setIsLoading(true);
    try {
      const match = locationUrl.match(/\/location\/(\d+)\//);
      if (match) {
        const location = await getLocationById(parseInt(match[1], 10));
        setSelectedLocation(location);
        setCurrentLevel("areas");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAreaClick = async (areaUrl: string) => {
    setIsLoading(true);
    try {
      const match = areaUrl.match(/\/location-area\/(\d+)\//);
      if (match) {
        const area = await getLocationAreaById(parseInt(match[1], 10));
        setSelectedArea(area);
        setCurrentLevel("encounters");
      }
    } catch (error) {
      console.error("Error fetching area:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbs = [
    { label: "Regions", onClick: () => setCurrentLevel("regions") },
    selectedRegion && {
      label: selectedRegion.name,
      onClick: () => setCurrentLevel("locations"),
    },
    selectedLocation && {
      label: selectedLocation.name,
      onClick: () => setCurrentLevel("areas"),
    },
    selectedArea && { label: selectedArea.name },
  ].filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoaderSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <nav className="flex flex-wrap gap-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-gray-400">/</span>}
              {crumb?.onClick ? (
                <button
                  onClick={crumb.onClick}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-gray-600 dark:text-gray-400">
                  {crumb?.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Regions */}
      {currentLevel === "regions" && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {initialData.results.map((region) => (
            <motion.button
              key={region.name}
              variants={staggerItem}
              onClick={() => handleRegionClick(region.url)}
              whileHover={{ scale: 1.05, y: -4 }}
              className="rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-800"
            >
              <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
                {region.name.replace(/-/g, " ")}
              </h3>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Locations */}
      {currentLevel === "locations" && selectedRegion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {selectedRegion.locations.map((location) => (
            <motion.button
              key={location.name}
              onClick={() => handleLocationClick(location.url)}
              whileHover={{ scale: 1.05, y: -4 }}
              className="rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-800"
            >
              <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
                {location.name.replace(/-/g, " ")}
              </h3>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Areas */}
      {currentLevel === "areas" && selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {selectedLocation.areas.map((area) => (
            <motion.button
              key={area.name}
              onClick={() => handleAreaClick(area.url)}
              whileHover={{ scale: 1.05, y: -4 }}
              className="rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-800"
            >
              <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
                {area.name.replace(/-/g, " ")}
              </h3>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Encounters */}
      {currentLevel === "encounters" && selectedArea && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Pokémon Encounters
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {selectedArea.pokemon_encounters.map((encounter) => {
              const pokemonId = encounter.pokemon.url.match(/\/pokemon\/(\d+)\//)?.[1];
              return (
                <Link
                  key={encounter.pokemon.name}
                  href={`/pokemon/${pokemonId}`}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-800"
                >
                  <h3 className="mb-2 text-lg font-semibold capitalize text-gray-900 dark:text-gray-100">
                    {encounter.pokemon.name.replace(/-/g, " ")}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {encounter.version_details.map((versionDetail) => (
                      <div key={versionDetail.version.name}>
                        <p className="font-medium">{versionDetail.version.name}</p>
                        <p>Max chance: {versionDetail.max_chance}%</p>
                        <p>
                          {versionDetail.encounter_details.length} encounter
                          method(s)
                        </p>
                      </div>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

