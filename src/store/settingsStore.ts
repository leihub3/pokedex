import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  battleCommentaryEnabled: boolean;
  setBattleCommentaryEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      battleCommentaryEnabled: true,
      setBattleCommentaryEnabled: (battleCommentaryEnabled) =>
        set({ battleCommentaryEnabled }),
    }),
    {
      name: "pokemon-settings",
    }
  )
);


