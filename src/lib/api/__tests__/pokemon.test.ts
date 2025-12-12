import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPokemonList, getPokemonById } from "../pokemon";
import { PokemonSchema, PokemonListResponseSchema } from "@/types/api";

// Mock fetch
global.fetch = vi.fn();

describe("Pokemon API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPokemonList", () => {
    it("should fetch and validate Pokemon list", async () => {
      const mockResponse = {
        count: 1302,
        next: "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
        previous: null,
        results: [
          { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
          { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
        ],
      };

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getPokemonList(0, 20);

      expect(fetch).toHaveBeenCalledWith(
        "https://pokeapi.co/api/v2/pokemon?offset=0&limit=20",
        expect.objectContaining({
          next: expect.objectContaining({ revalidate: 3600 }),
        })
      );

      expect(result).toEqual(mockResponse);
      expect(() => PokemonListResponseSchema.parse(result)).not.toThrow();
    });

    it("should handle API errors", async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(getPokemonList(0, 20)).rejects.toThrow("API Error");
    });
  });

  describe("getPokemonById", () => {
    it("should fetch and validate a single Pokemon", async () => {
      const mockPokemon = {
        id: 1,
        name: "bulbasaur",
        base_experience: 64,
        height: 7,
        weight: 69,
        sprites: {
          front_default: "https://pokeapi.co/api/v2/pokemon/1.png",
          front_shiny: null,
          other: {
            "official-artwork": {
              front_default: "https://pokeapi.co/api/v2/pokemon/1.png",
              front_shiny: null,
            },
          },
        },
        types: [
          {
            slot: 1,
            type: { name: "grass", url: "https://pokeapi.co/api/v2/type/12/" },
          },
        ],
        stats: [
          {
            base_stat: 45,
            effort: 0,
            stat: { name: "hp", url: "https://pokeapi.co/api/v2/stat/1/" },
          },
        ],
        abilities: [
          {
            ability: {
              name: "overgrow",
              url: "https://pokeapi.co/api/v2/ability/65/",
            },
            is_hidden: false,
            slot: 1,
          },
        ],
        moves: [],
      };

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPokemon,
      });

      const result = await getPokemonById(1);

      expect(fetch).toHaveBeenCalledWith(
        "https://pokeapi.co/api/v2/pokemon/1",
        expect.any(Object)
      );

      expect(result.id).toBe(1);
      expect(result.name).toBe("bulbasaur");
      expect(() => PokemonSchema.parse(result)).not.toThrow();
    });

    it("should handle invalid Pokemon ID", async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(getPokemonById(99999)).rejects.toThrow("API Error");
    });
  });
});

