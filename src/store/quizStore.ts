import { create } from "zustand";
import { persist } from "zustand/middleware";

interface QuizScore {
  score: number;
  total: number;
  time: number;
  date: string;
}

interface QuizStore {
  scores: QuizScore[];
  addScore: (score: QuizScore) => void;
  getHighScore: () => QuizScore | null;
  clearScores: () => void;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      scores: [],
      addScore: (score) =>
        set((state) => ({
          scores: [...state.scores, score].sort(
            (a, b) => b.score - a.score || a.time - b.time
          ),
        })),
      getHighScore: () => {
        const scores = get().scores;
        return scores.length > 0 ? scores[0] : null;
      },
      clearScores: () => set({ scores: [] }),
    }),
    {
      name: "pokemon-quiz",
    }
  )
);

