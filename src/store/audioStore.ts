import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioStore {
  enabled: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  setEnabled: (enabled: boolean) => void;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSFXVolume: (volume: number) => void;
}

export const useAudioStore = create<AudioStore>()(
  persist(
    (set) => ({
      enabled: true,
      masterVolume: 0.7,
      musicVolume: 0.5,
      sfxVolume: 0.8,
      setEnabled: (enabled) => set({ enabled }),
      setMasterVolume: (volume) => set({ masterVolume: Math.max(0, Math.min(1, volume)) }),
      setMusicVolume: (volume) => set({ musicVolume: Math.max(0, Math.min(1, volume)) }),
      setSFXVolume: (volume) => set({ sfxVolume: Math.max(0, Math.min(1, volume)) }),
    }),
    { name: "pokemon-audio-settings" }
  )
);
