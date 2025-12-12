"use client";

import { useEffect, useState } from "react";
import { usePokemonStore } from "@/store/pokemonStore";
import { getPokemonById } from "@/lib/api/pokemon";
import type { Pokemon } from "@/types/api";

export function usePokemonList() {
  const {
    pokemonListItems,
    searchQuery,
    selectedTypes,
    isLoading,
    setLoading,
    addPokemon,
  } = usePokemonStore();

  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);

  // Fetch Pokemon details from list items
  useEffect(() => {
    const fetchPokemonDetails = async () => {
      if (pokemonListItems.length === 0) return;

      setLoading(true);
      try {
        // Get IDs from URLs (format: https://pokeapi.co/api/v2/pokemon/1/)
        const ids = pokemonListItems.map((item) => {
          const match = item.url.match(/\/pokemon\/(\d+)\//);
          return match ? parseInt(match[1], 10) : null;
        }).filter((id): id is number => id !== null);

        // Fetch all Pokemon details
        const details = await Promise.all(
          ids.map((id) => getPokemonById(id))
        );

        setPokemonData(details);
        addPokemon(details);
      } catch (error) {
        console.error("Error fetching Pokemon details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonDetails();
  }, [pokemonListItems, setLoading, addPokemon]);

  // Filter Pokemon based on search and types
  useEffect(() => {
    let filtered = pokemonData;

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

    setFilteredPokemon(filtered);
  }, [pokemonData, searchQuery, selectedTypes]);

  return {
    pokemon: filteredPokemon,
    isLoading,
    totalCount: pokemonData.length,
    filteredCount: filteredPokemon.length,
  };
}

export function usePokemon(id: string | number) {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPokemonById(id);
        setPokemon(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch Pokemon"));
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPokemon();
    }
  }, [id]);

  return { pokemon, isLoading, error };
}

