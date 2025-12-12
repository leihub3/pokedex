import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuizScore {
  score: number;
  total: number;
  time: number;
  date: string;
  accuracy?: number; // porcentaje de aciertos
  streak?: number; // racha actual
  playerName?: string; // nombre del jugador
}

export interface QuizStats {
  totalGames: number;
  averageScore: number;
  averageAccuracy: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
}

interface QuizStore {
  scores: QuizScore[];
  playerName: string; // nombre predeterminado del jugador
  setPlayerName: (name: string) => void;
  addScore: (score: QuizScore) => void;
  getHighScore: () => QuizScore | null;
  clearScores: () => void;
  
  // Nuevas funciones
  getStats: () => QuizStats;
  getRecentScores: (limit?: number) => QuizScore[];
  getTopScores: (limit?: number) => QuizScore[];
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      scores: [],
      playerName: "",
      setPlayerName: (name: string) => set({ playerName: name }),
      addScore: (score) => {
        const scores = get().scores;
        const lastScore = scores.length > 0 ? scores[scores.length - 1] : null;
        
        // Calcular accuracy si no viene
        const accuracy = score.accuracy ?? (score.total > 0 ? (score.score / score.total) * 100 : 0);
        
        // Calcular streak: continúa si el score es mayor o igual al anterior, se resetea si es menor
        let streak = 1;
        if (lastScore && score.score > 0) {
          if (score.score >= lastScore.score) {
            // Mantener o incrementar streak si el score es mejor o igual
            streak = (lastScore.streak || 0) + 1;
          } else {
            // Resetear streak si el score es menor
            streak = 1;
          }
        } else if (score.score === 0) {
          streak = 0;
        }
        
        // Usar el nombre del jugador del score o el nombre predeterminado
        const playerName = score.playerName || get().playerName || "Player";
        
        const newScore: QuizScore = {
          ...score,
          accuracy,
          streak,
          playerName,
        };
        
        set((state) => ({
          scores: [...state.scores, newScore].sort(
            (a, b) => b.score - a.score || a.time - b.time
          ),
        }));
      },
      getHighScore: () => {
        const scores = get().scores;
        return scores.length > 0 ? scores[0] : null;
      },
      getStats: (): QuizStats => {
        const scores = get().scores;
        if (scores.length === 0) {
          return {
            totalGames: 0,
            averageScore: 0,
            averageAccuracy: 0,
            bestScore: 0,
            currentStreak: 0,
            longestStreak: 0,
          };
        }
        
        const totalGames = scores.length;
        const averageScore = scores.reduce((sum, s) => sum + s.score, 0) / totalGames;
        const averageAccuracy = scores.reduce((sum, s) => sum + (s.accuracy || 0), 0) / totalGames;
        const bestScore = Math.max(...scores.map(s => s.score));
        const longestStreak = Math.max(...scores.map(s => s.streak || 0), 0);
        const currentStreak = scores[scores.length - 1]?.streak || 0;
        
        return {
          totalGames,
          averageScore: Math.round(averageScore * 10) / 10,
          averageAccuracy: Math.round(averageAccuracy * 10) / 10,
          bestScore,
          currentStreak,
          longestStreak,
        };
      },
      getRecentScores: (limit = 10) => {
        const scores = get().scores;
        return [...scores].reverse().slice(0, limit);
      },
      getTopScores: (limit = 10) => {
        const scores = get().scores;
        return scores.slice(0, limit);
      },
      clearScores: () => set({ scores: [] }),
    }),
    {
      name: "pokemon-quiz",
    }
  )
);

