"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { getPokemonList, getPokemonById, getAllPokemonList, getPokemonByTypes } from "@/lib/api/pokemon";
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
  const [typeFilteredIds, setTypeFilteredIds] = useState<number[]>([]);
  const [typeResultsCount, setTypeResultsCount] = useState<number>(0);
  const loadedSearchIdsRef = useRef<Set<number>>(new Set());
  const loadedTypeIdsRef = useRef<Set<number>>(new Set());
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
    const fetchAllPokemonList = async () => {
      if (searchQuery.trim() && allPokemonListItems.length === 0) {
        setLoading(true);
        try {
          const allPokemon = await getAllPokemonList();
          setAllPokemonListItems(allPokemon.results);
        } catch (error) {
          console.error("Error fetching all Pokemon list:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAllPokemonList();
  }, [searchQuery, allPokemonListItems.length, setAllPokemonListItems, setLoading]);

  // Track previous selected types to detect changes
  const prevSelectedTypesRef = useRef<string[]>([]);
  
  // Fetch Pokémon by type when type filter is active
  useEffect(() => {
    const fetchPokemonByType = async () => {
      if (selectedTypes.length > 0) {
        // Only fetch if types changed
        const typesChanged = 
          selectedTypes.length !== prevSelectedTypesRef.current.length ||
          !selectedTypes.every((type, idx) => type === prevSelectedTypesRef.current[idx]);
        
        if (typesChanged) {
          setLoading(true);
          try {
            const typePokemon = await getPokemonByTypes(selectedTypes);
            // Store the filtered list items for type filtering
            setAllPokemonListItems(typePokemon);
            prevSelectedTypesRef.current = [...selectedTypes];
          } catch (error) {
            console.error("Error fetching Pokemon by type:", error);
          } finally {
            setLoading(false);
          }
        }
      } else if (prevSelectedTypesRef.current.length > 0) {
        // Types were cleared, reset the list if we're not searching
        if (!searchQuery.trim()) {
          setAllPokemonListItems([]);
          prevSelectedTypesRef.current = [];
        }
      }
    };

    fetchPokemonByType();
  }, [selectedTypes, searchQuery, setAllPokemonListItems, setLoading]);

  // Filter Pokemon based on search and types
  useEffect(() => {
    // If searching, use allPokemonListItems (contains all Pokemon for search)
    // If filtering by type, use allPokemonListItems (contains only Pokemon of selected types)
    const hasActiveFilter = searchQuery.trim() || selectedTypes.length > 0;
    const hasFullList = allPokemonListItems.length > 0;
    
    if (hasActiveFilter && hasFullList) {
      let filteredListItems = allPokemonListItems;

      // Apply search filter if active (on top of type filter if both are active)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredListItems = filteredListItems.filter((item) =>
          item.name.toLowerCase().includes(query)
        );
      }

      // Get all IDs from filtered list items
      const allFilteredIds = filteredListItems
        .map((item) => {
          const match = item.url.match(/\/pokemon\/(\d+)\//);
          return match ? parseInt(match[1], 10) : null;
        })
        .filter((id): id is number => id !== null);

      // Handle type filter mode
      if (selectedTypes.length > 0) {
        setTypeFilteredIds(allFilteredIds);
        setTypeResultsCount(allFilteredIds.length); // Accurate count since we got it from API
        if (!searchQuery.trim()) {
          // Type filter only, no search
          setSearchFilteredIds([]);
          setSearchResultsCount(0);
        }
      } else if (searchQuery.trim()) {
        // Search only mode
        setSearchFilteredIds(allFilteredIds);
        setSearchResultsCount(allFilteredIds.length);
        setTypeFilteredIds([]);
        setTypeResultsCount(0);
      }

      // Filter pokemonList by IDs (only show loaded ones)
      const filtered = pokemonList.filter((pokemon) =>
        allFilteredIds.includes(pokemon.id)
      );

      // Update displayed pokemon immediately
      setDisplayedPokemon(filtered);

      // Load missing Pokémon details (load in batches)
      const existingIds = new Set(pokemonList.map((p) => p.id));
      const missingIds = allFilteredIds.filter((id) => !existingIds.has(id));
      
      // Determine which ref to use
      const activeRef = selectedTypes.length > 0 ? loadedTypeIdsRef : loadedSearchIdsRef;
      
      // Load first batch of 20 if we have missing IDs and not currently loading
      const batchSize = 20;
      const idsToLoad = missingIds.slice(0, batchSize);
      const alreadyLoaded = idsToLoad.length > 0 && idsToLoad.every((id) => activeRef.current.has(id));

      if (idsToLoad.length > 0 && !alreadyLoaded && !isLoading) {
        setLoading(true);
        // Mark these IDs as being loaded
        idsToLoad.forEach((id) => activeRef.current.add(id));
        
        Promise.all(idsToLoad.map((id) => getPokemonById(id)))
          .then((details) => {
            addPokemon(details);
            // The effect will re-run when pokemonList updates
          })
          .catch((error) => {
            console.error("Error fetching Pokemon details:", error);
            // Remove from loaded set on error so we can retry
            idsToLoad.forEach((id) => activeRef.current.delete(id));
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else if (!hasActiveFilter) {
      // Normal mode: filter from loaded pokemonList only
      setSearchResultsCount(0);
      setSearchFilteredIds([]);
      setTypeResultsCount(0);
      setTypeFilteredIds([]);
      
      // Reset loaded refs if filters are cleared
      loadedSearchIdsRef.current.clear();
      loadedTypeIdsRef.current.clear();
      
      let filtered = pokemonList;

      // Apply search filter (on already loaded Pokemon only)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter((pokemon) =>
          pokemon.name.toLowerCase().includes(query)
        );
      }

      // Apply type filter (on already loaded Pokemon only)
      if (selectedTypes.length > 0) {
        filtered = filtered.filter((pokemon) =>
          pokemon.types.some((typeSlot) =>
            selectedTypes.includes(typeSlot.type.name)
          )
        );
      }

      setDisplayedPokemon(filtered);
    }
  }, [pokemonList, allPokemonListItems, searchQuery, selectedTypes, isLoading, addPokemon, setLoading]);


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

  // Load more search results or type filtered results
  const loadMoreFilteredResults = async () => {
    const activeFilteredIds = selectedTypes.length > 0 ? typeFilteredIds : searchFilteredIds;
    const activeRef = selectedTypes.length > 0 ? loadedTypeIdsRef : loadedSearchIdsRef;
    
    if (isLoading || activeFilteredIds.length === 0) return;
    
    const existingIds = new Set(pokemonList.map((p) => p.id));
    const missingIds = activeFilteredIds.filter((id) => !existingIds.has(id));
    
    if (missingIds.length === 0) return;

    setLoading(true);
    try {
      // Load next batch of 20
      const batchSize = 20;
      const nextBatch = missingIds.slice(0, batchSize);
      
      // Mark as being loaded
      nextBatch.forEach((id) => activeRef.current.add(id));
      
      const details = await Promise.all(
        nextBatch.map((id) => getPokemonById(id))
      );
      addPokemon(details);
      // The effect will re-run when pokemonList updates
    } catch (error) {
      console.error("Error loading more filtered results:", error);
      // Remove from loaded set on error so we can retry
      const activeRef = selectedTypes.length > 0 ? loadedTypeIdsRef : loadedSearchIdsRef;
      const nextBatch = missingIds.slice(0, 20);
      nextBatch.forEach((id) => activeRef.current.delete(id));
    } finally {
      setLoading(false);
    }
  };

  // Determine if we have more filtered results to load
  const hasMoreFilteredResults = Boolean(
    (searchQuery.trim() || selectedTypes.length > 0) && 
    ((selectedTypes.length > 0 ? typeFilteredIds : searchFilteredIds).length > 0) && 
    pokemonList.filter((p) => (selectedTypes.length > 0 ? typeFilteredIds : searchFilteredIds).includes(p.id)).length < 
    (selectedTypes.length > 0 ? typeFilteredIds : searchFilteredIds).length
  );

  const shouldUseInfiniteScroll = searchQuery.trim() || selectedTypes.length > 0;
  
  const loadMoreRef = useInfiniteScroll({
    hasMore: shouldUseInfiniteScroll ? hasMoreFilteredResults : hasMore,
    isLoading,
    onLoadMore: shouldUseInfiniteScroll ? loadMoreFilteredResults : loadMore,
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <SearchBar />
        </div>
        <div className="flex items-start gap-4">
          <SortSelector value={sortOption} onChange={setSortOption} />
          <div className="w-full md:w-80">
            <TypeFilter />
          </div>
        </div>
      </div>

      {/* Results Count */}
      {(searchQuery || selectedTypes.length > 0) && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedTypes.length > 0 && typeResultsCount > 0 ? (
            <>
              Showing {displayedPokemon.length} of {typeResultsCount} Pokémon
              {displayedPokemon.length < typeResultsCount && (
                <span className="ml-2 text-xs">
                  (loading more...)
                </span>
              )}
            </>
          ) : searchQuery.trim() && searchResultsCount > 0 ? (
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

          {/* Infinite Scroll Trigger - Works for normal browsing, search, and type filter */}
          {(hasMore || hasMoreFilteredResults) && (
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

