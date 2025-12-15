import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAllEliteFourConfigs } from "@/data/eliteFour";

export type GameMode = "free" | "career" | "master";

export interface CareerProgress {
  unlockedRegions: string[]; // Region IDs that are unlocked
  completedRegions: string[]; // Region IDs that have been completed
  currentRegion: string | null; // Current region in career mode
  masterModeUnlocked: boolean;
  masterModeCompleted: boolean;
  masterModeCurrentRegionIndex: number; // Index of current region in Master Mode (0-5)
  masterModeRegionsCompleted: string[]; // Regions completed in current Master Mode run
}

interface EliteFourCareerStore {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  careerProgress: CareerProgress;
  unlockRegion: (regionId: string) => void;
  completeRegion: (regionId: string) => void;
  startCareer: () => void;
  startMasterMode: () => void;
  resetCareer: () => void;
  getNextUnlockedRegion: () => string | null;
  isRegionUnlocked: (regionId: string) => boolean;
  isRegionCompleted: (regionId: string) => boolean;
  getCareerProgressPercentage: () => number;
  completeMasterModeRegion: (regionId: string) => void;
  getMasterModeCurrentRegion: () => ReturnType<typeof getAllEliteFourConfigs>[0] | null;
  getMasterModeProgress: () => { current: number; total: number; completed: number };
}

export const useEliteFourCareerStore = create<EliteFourCareerStore>()(
  persist(
    (set, get) => ({
      gameMode: "free",
      setGameMode: (mode) => set({ gameMode: mode }),

      careerProgress: {
        unlockedRegions: ["kanto"], // Kanto unlocked by default
        completedRegions: [],
        currentRegion: "kanto",
        masterModeUnlocked: false,
        masterModeCompleted: false,
        masterModeCurrentRegionIndex: 0,
        masterModeRegionsCompleted: [],
      },

      unlockRegion: (regionId) => {
        const progress = get().careerProgress;
        if (!progress.unlockedRegions.includes(regionId)) {
          set({
            careerProgress: {
              ...progress,
              unlockedRegions: [...progress.unlockedRegions, regionId],
            },
          });
        }
      },

      completeRegion: (regionId) => {
        const progress = get().careerProgress;
        const isNewlyCompleted = !progress.completedRegions.includes(regionId);

        if (isNewlyCompleted) {
          const allRegions = getAllEliteFourConfigs();
          const currentIndex = allRegions.findIndex((r) => r.id === regionId);
          const nextRegion =
            currentIndex < allRegions.length - 1
              ? allRegions[currentIndex + 1]
              : null;

          // Unlock next region
          let newUnlocked = [...progress.unlockedRegions];
          let masterModeUnlocked = progress.masterModeUnlocked;

          if (nextRegion) {
            if (!newUnlocked.includes(nextRegion.id)) {
              newUnlocked.push(nextRegion.id);
            }
          } else {
            // Completed all regions - unlock Master Mode
            masterModeUnlocked = true;
          }

          set({
            careerProgress: {
              ...progress,
              completedRegions: [...progress.completedRegions, regionId],
              unlockedRegions: newUnlocked,
              masterModeUnlocked,
              currentRegion: nextRegion?.id || null,
            },
          });
        }
      },

      startCareer: () => {
        const progress = get().careerProgress;
        // Start from first uncompleted region, or Kanto if all completed
        const allRegions = getAllEliteFourConfigs();
        const firstUncompleted = allRegions.find(
          (r) => !progress.completedRegions.includes(r.id)
        );

        set({
          gameMode: "career",
          careerProgress: {
            ...progress,
            currentRegion: firstUncompleted?.id || "kanto",
          },
        });
      },

      startMasterMode: () => {
        set({
          gameMode: "master",
          careerProgress: {
            ...get().careerProgress,
            masterModeCurrentRegionIndex: 0,
            masterModeRegionsCompleted: [],
          },
        });
      },

      resetCareer: () => {
        set({
          careerProgress: {
            unlockedRegions: ["kanto"],
            completedRegions: [],
            currentRegion: "kanto",
            masterModeUnlocked: false,
            masterModeCompleted: false,
            masterModeCurrentRegionIndex: 0,
            masterModeRegionsCompleted: [],
          },
          gameMode: "free",
        });
      },

      getNextUnlockedRegion: () => {
        const progress = get().careerProgress;
        const allRegions = getAllEliteFourConfigs();
        const uncompleted = allRegions.find(
          (r) =>
            progress.unlockedRegions.includes(r.id) &&
            !progress.completedRegions.includes(r.id)
        );
        return uncompleted?.id || null;
      },

      isRegionUnlocked: (regionId) => {
        return get().careerProgress.unlockedRegions.includes(regionId);
      },

      isRegionCompleted: (regionId) => {
        return get().careerProgress.completedRegions.includes(regionId);
      },

      getCareerProgressPercentage: () => {
        const progress = get().careerProgress;
        const allRegions = getAllEliteFourConfigs();
        return (progress.completedRegions.length / allRegions.length) * 100;
      },
      
      // Master Mode helpers
      completeMasterModeRegion: (regionId: string) => {
        const progress = get().careerProgress;
        const allRegions = getAllEliteFourConfigs();
        const currentIndex = progress.masterModeCurrentRegionIndex;
        
        if (!progress.masterModeRegionsCompleted.includes(regionId)) {
          const newCompleted = [...progress.masterModeRegionsCompleted, regionId];
          const nextIndex = currentIndex + 1;
          const isComplete = nextIndex >= allRegions.length;
          
          set({
            careerProgress: {
              ...progress,
              masterModeRegionsCompleted: newCompleted,
              masterModeCurrentRegionIndex: isComplete ? currentIndex : nextIndex,
              masterModeCompleted: isComplete,
            },
          });
        }
      },
      
      getMasterModeCurrentRegion: () => {
        const progress = get().careerProgress;
        const allRegions = getAllEliteFourConfigs();
        const index = progress.masterModeCurrentRegionIndex;
        return index < allRegions.length ? allRegions[index] : null;
      },
      
      getMasterModeProgress: () => {
        const progress = get().careerProgress;
        const allRegions = getAllEliteFourConfigs();
        return {
          current: progress.masterModeCurrentRegionIndex + 1,
          total: allRegions.length,
          completed: progress.masterModeRegionsCompleted.length,
        };
      },
    }),
    {
      name: "pokemon-elite-four-career",
    }
  )
);

