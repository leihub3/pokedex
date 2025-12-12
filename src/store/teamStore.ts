import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Pokemon } from "@/types/api";

interface TeamStore {
  team: (Pokemon | null)[];
  addToTeam: (pokemon: Pokemon, slot: number) => void;
  removeFromTeam: (slot: number) => void;
  clearTeam: () => void;
  getTeamStats: () => {
    totalHP: number;
    totalAttack: number;
    totalDefense: number;
    totalSpAttack: number;
    totalSpDefense: number;
    totalSpeed: number;
  };
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      team: Array(6).fill(null),
      addToTeam: (pokemon, slot) =>
        set((state) => {
          const newTeam = [...state.team];
          newTeam[slot] = pokemon;
          return { team: newTeam };
        }),
      removeFromTeam: (slot) =>
        set((state) => {
          const newTeam = [...state.team];
          newTeam[slot] = null;
          return { team: newTeam };
        }),
      clearTeam: () => set({ team: Array(6).fill(null) }),
      getTeamStats: () => {
        const team = get().team.filter((p): p is Pokemon => p !== null);
        return {
          totalHP: team.reduce(
            (sum, p) =>
              sum + (p.stats.find((s) => s.stat.name === "hp")?.base_stat ?? 0),
            0
          ),
          totalAttack: team.reduce(
            (sum, p) =>
              sum +
              (p.stats.find((s) => s.stat.name === "attack")?.base_stat ?? 0),
            0
          ),
          totalDefense: team.reduce(
            (sum, p) =>
              sum +
              (p.stats.find((s) => s.stat.name === "defense")?.base_stat ?? 0),
            0
          ),
          totalSpAttack: team.reduce(
            (sum, p) =>
              sum +
              (p.stats.find((s) => s.stat.name === "special-attack")
                ?.base_stat ?? 0),
            0
          ),
          totalSpDefense: team.reduce(
            (sum, p) =>
              sum +
              (p.stats.find((s) => s.stat.name === "special-defense")
                ?.base_stat ?? 0),
            0
          ),
          totalSpeed: team.reduce(
            (sum, p) =>
              sum +
              (p.stats.find((s) => s.stat.name === "speed")?.base_stat ?? 0),
            0
          ),
        };
      },
    }),
    {
      name: "pokemon-team",
    }
  )
);

