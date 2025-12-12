"use client";

import { useEffect, useState, useMemo } from "react";
import { getPokemonList, getPokemonById, getAllPokemonList } from "@/lib/api/pokemon";
import { usePokemonStore } from "@/store/pokemonStore";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { PokemonCard } from "./PokemonCard";
import { SearchBar } from "./SearchBar";
import { TypeFilter } from "./TypeFilter";
import { SortSelector, type SortOption } from "./SortSelector";
import { PokemonCardSkeleton } from "@/components/ui/Skeleton";
import { getTotalBaseStats } from "@/lib/utils/battleCalculations";
import { staggerContainer } from "@/lib/utils/animations";
import { motion } from "framer-motion";
import type { PokemonListResponse, Pokemon, PokemonListItem } from "@/types/api";

interface PokemonListClientProps {
  initialData: PokemonListResponse;
}

export function PokemonListClient({ initialData }: PokemonListClientProps) {
  const {
    pokemonList,
    pokemonListItems,
    allPokemonListItems,
    searchQuery,
    selectedTypes,
    isLoading,
    hasMore,
    nextUrl,
    setPokemonListItems,
    addPokemonListItems,
    setAllPokemonListItems,
    setNextUrl,
    setHasMore,
    setLoading,
    addPokemon,
  } = usePokemonStore();

  const [displayedPokemon, setDisplayedPokemon] = useState<Pokemon[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchResultsCount, setSearchResultsCount] = useState<number>(0);
  const [searchFilteredIds, setSearchFilteredIds] = useState<number[]>([]);
  const [loadedSearchIds, setLoadedSearchIds] = useState<Set<number>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>("id");

  // Initialize store with initial data
  useEffect(() => {
    if (initialLoad && initialData.results.length > 0) {
      setPokemonListItems(initialData.results);
      setNextUrl(initialData.next);
      setHasMore(!!initialData.next);
      setInitialLoad(false);
    }
  }, [
    initialData,
    initialLoad,
    setPokemonListItems,
    setNextUrl,
    setHasMore,
  ]);

  // Fetch Pokemon details when list items change
  useEffect(() => {
    const fetchPokemonDetails = async () => {
      if (pokemonListItems.length === 0) return;

      setLoading(true);
      try {
        // Get IDs from URLs
        const ids = pokemonListItems.map((item) => {
          const match = item.url.match(/\/pokemon\/(\d+)\//);
          return match ? parseInt(match[1], 10) : null;
        }).filter((id): id is number => id !== null);

        // Check which Pokemon we already have
        const existingIds = new Set(pokemonList.map((p) => p.id));
        const newIds = ids.filter((id) => !existingIds.has(id));

        if (newIds.length > 0) {
          // Fetch only new Pokemon
          const details = await Promise.all(
            newIds.map((id) => getPokemonById(id))
          );
          addPokemon(details);
        }
      } catch (error) {
        console.error("Error fetching Pokemon details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonDetails();
  }, [pokemonListItems, pokemonList, setLoading, addPokemon]);

  // Fetch all Pokémon list when search is active (only once)
  useEffect(() => {
    const fetchAllPokemonForSearch = async () => {
      if (searchQuery.trim() && allPokemonListItems.length === 0) {
        setLoading(true);
        try {
          const allPokemon = await getAllPokemonList();
          setAllPokemonListItems(allPokemon.results);
        } catch (error) {
          console.error("Error fetching all Pokemon for search:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAllPokemonForSearch();
  }, [searchQuery, allPokemonListItems.length, setAllPokemonListItems, setLoading]);

  // Filter Pokemon based on search and types
  useEffect(() => {
    // If searching, use allPokemonListItems, otherwise use pokemonList
    if (searchQuery.trim() && allPokemonListItems.length > 0) {
      // Search mode: filter from complete list
      const query = searchQuery.toLowerCase().trim();
      
      // Filter list items by name
      const filteredListItems = allPokemonListItems.filter((item) =>
        item.name.toLowerCase().includes(query)
      );

      // Update search results count
      setSearchResultsCount(filteredListItems.length);

      // Get IDs from filtered list items
      const filteredIds = filteredListItems
        .map((item) => {
          const match = item.url.match(/\/pokemon\/(\d+)\//);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((id): id is number => id !== null);

      // Store filtered IDs for loading more
      setSearchFilteredIds(filteredIds);

      // Filter pokemonList by IDs (only show loaded ones)
      let filtered = pokemonList.filter((pokemon) =>
        filteredIds.includes(pokemon.id)
      );

      // Apply type filter
      if (selectedTypes.length > 0) {
        filtered = filtered.filter((pokemon) =>
          pokemon.types.some((typeSlot) =>
            selectedTypes.includes(typeSlot.type.name)
          )
        );
      }

      // Update displayed pokemon immediately
      setDisplayedPokemon(filtered);

      // Load missing Pokémon details (load in batches)
      const existingIds = new Set(pokemonList.map((p) => p.id));
      const missingIds = filteredIds.filter((id) => !existingIds.has(id));
      
      // Load first batch of 20 if we have missing IDs and not currently loading
      const batchSize = 20;
      const idsToLoad = missingIds.slice(0, batchSize);
      const alreadyLoaded = idsToLoad.length > 0 && idsToLoad.every((id) => loadedSearchIds.has(id));

      if (idsToLoad.length > 0 && !alreadyLoaded && !isLoading) {
        setLoading(true);
        // Mark these IDs as being loaded
        setLoadedSearchIds((prev) => new Set([...prev, ...idsToLoad]));
        
        Promise.all(idsToLoad.map((id) => getPokemonById(id)))
          .then((details) => {
            addPokemon(details);
            // The effect will re-run when pokemonList updates
          })
          .catch((error) => {
            console.error("Error fetching Pokemon details for search:", error);
            // Remove from loaded set on error so we can retry
            setLoadedSearchIds((prev) => {
              const newSet = new Set(prev);
              idsToLoad.forEach((id) => newSet.delete(id));
              return newSet;
            });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      // Normal mode: filter from loaded pokemonList
      setSearchResultsCount(0);
      setSearchFilteredIds([]);
      setLoadedSearchIds(new Set());
      let filtered = pokemonList;

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter((pokemon) =>
          pokemon.name.toLowerCase().includes(query)
        );
      }

      // Apply type filter
      if (selectedTypes.length > 0) {
        filtered = filtered.filter((pokemon) =>
          pokemon.types.some((typeSlot) =>
            selectedTypes.includes(typeSlot.type.name)
          )
        );
      }

      setDisplayedPokemon(filtered);
    }
  }, [pokemonList, allPokemonListItems, searchQuery, selectedTypes, isLoading, addPokemon, setLoading, loadedSearchIds]);

  // Sort displayed Pokemon
  const sortedPokemon = useMemo(() => {
    const sorted = [...displayedPokemon];
    sorted.sort((a, b) => {
      switch (sortOption) {
        case "id":
          return a.id - b.id;
        case "name":
          return a.name.localeCompare(b.name);
        case "base-stats":
          return getTotalBaseStats(b) - getTotalBaseStats(a);
        case "height":
          return b.height - a.height;
        case "weight":
          return b.weight - a.weight;
        case "base-experience":
          return (b.base_experience ?? 0) - (a.base_experience ?? 0);
        default:
          return 0;
      }
    });
    return sorted;
  }, [displayedPokemon, sortOption]);

  // Load more Pokemon (for normal browsing)
  const loadMore = async () => {
    if (!hasMore || isLoading || !nextUrl) return;

    setLoading(true);
    try {
      const response = await getPokemonList(
        pokemonListItems.length,
        20
      );
      addPokemonListItems(response.results);
      setNextUrl(response.next);
      setHasMore(!!response.next);
    } catch (error) {
      console.error("Error loading more Pokemon:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load more search results
  const loadMoreSearchResults = async () => {
    if (isLoading || searchFilteredIds.length === 0) return;
    
    const existingIds = new Set(pokemonList.map((p) => p.id));
    const missingIds = searchFilteredIds.filter((id) => !existingIds.has(id));
    
    if (missingIds.length === 0) return;

    setLoading(true);
    try {
      // Load next batch of 20
      const batchSize = 20;
      const nextBatch = missingIds.slice(0, batchSize);
      
      // Mark as being loaded
      setLoadedSearchIds((prev) => new Set([...prev, ...nextBatch]));
      
      const details = await Promise.all(
        nextBatch.map((id) => getPokemonById(id))
      );
      addPokemon(details);
      // The effect will re-run when pokemonList updates
    } catch (error) {
      console.error("Error loading more search results:", error);
    } finally {
      setLoading(false);
    }
  };

  // Determine if we have more search results to load
  const hasMoreSearchResults = Boolean(
    searchQuery.trim() && 
    searchFilteredIds.length > 0 && 
    pokemonList.filter((p) => searchFilteredIds.includes(p.id)).length < searchFilteredIds.length
  );

  const loadMoreRef = useInfiniteScroll({
    hasMore: searchQuery.trim() ? hasMoreSearchResults : hasMore,
    isLoading,
    onLoadMore: searchQuery.trim() ? loadMoreSearchResults : loadMore,
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <SearchBar />
        </div>
        <div className="flex gap-4">
          <SortSelector value={sortOption} onChange={setSortOption} />
          <div className="w-full md:w-80">
            <TypeFilter />
          </div>
        </div>
      </div>

      {/* Results Count */}
      {(searchQuery || selectedTypes.length > 0) && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {searchQuery.trim() && searchResultsCount > 0 ? (
            <>
              Showing {displayedPokemon.length} of {searchResultsCount} Pokémon
              {displayedPokemon.length < searchResultsCount && (
                <span className="ml-2 text-xs">
                  (loading more...)
                </span>
              )}
            </>
          ) : (
            <>Showing {displayedPokemon.length} of {pokemonList.length} Pokémon</>
          )}
        </div>
      )}

      {/* Pokemon Grid */}
      {sortedPokemon.length > 0 ? (
        <>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {sortedPokemon.map((pokemon: Pokemon, index: number) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} index={index} />
            ))}
          </motion.div>

          {/* Infinite Scroll Trigger - Works for both normal browsing and search */}
          {(hasMore || hasMoreSearchResults) && !searchQuery.trim() && (
            <div ref={loadMoreRef} className="py-8 text-center">
              {isLoading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <PokemonCardSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {isLoading
              ? "Loading Pokémon..."
              : "No Pokémon found. Try adjusting your search or filters."}
          </p>
        </div>
      )}
    </div>
  );
}

