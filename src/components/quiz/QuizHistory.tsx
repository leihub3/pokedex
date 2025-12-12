"use client";

import { useQuizStore, type QuizScore, type QuizStats } from "@/store/quizStore";
import { motion } from "framer-motion";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: QuizStats) => boolean;
  color: string;
}

const createBadges = (stats: QuizStats, scores: QuizScore[]): Badge[] => [
  {
    id: "first-win",
    name: "First Win",
    description: "Complete your first quiz",
    icon: "🎯",
    condition: (s) => s.totalGames >= 1,
    color: "bg-yellow-500",
  },
  {
    id: "perfect-score",
    name: "Perfectionist",
    description: "Get a perfect score (100%)",
    icon: "⭐",
    condition: () => scores.some(s => s.accuracy === 100),
    color: "bg-purple-500",
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Complete 10 quizzes quickly",
    icon: "⚡",
    condition: (s) => s.totalGames >= 10,
    color: "bg-orange-500",
  },
  {
    id: "dedication",
    name: "Dedicated Trainer",
    description: "Play 25 quizzes",
    icon: "🏆",
    condition: (s) => s.totalGames >= 25,
    color: "bg-blue-500",
  },
  {
    id: "streak-master",
    name: "Streak Master",
    description: "Achieve a 5 game streak",
    icon: "🔥",
    condition: (s) => s.longestStreak >= 5,
    color: "bg-green-500",
  },
  {
    id: "improvement",
    name: "Improvement",
    description: "Beat your best score",
    icon: "📈",
    condition: () => {
      if (scores.length < 2) return false;
      const bestScore = Math.max(...scores.slice(0, -1).map(s => s.score));
      const latestScore = scores[scores.length - 1]?.score || 0;
      return latestScore > bestScore && bestScore > 0;
    },
    color: "bg-pink-500",
  },
];

export function QuizHistory() {
  const { scores, getStats, getRecentScores, getTopScores, clearScores } = useQuizStore();
  const stats = getStats();
  const recentScores = getRecentScores(5);
  const topScores = getTopScores(5);
  
  const badges = createBadges(stats, scores);
  const earnedBadges = badges.filter(badge => badge.condition(stats));
  
  if (scores.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
        <p className="text-center text-gray-600 dark:text-gray-400">
          No quiz history yet. Play your first game to see your stats!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Games"
          value={stats.totalGames}
          icon="🎮"
        />
        <StatCard
          title="Best Score"
          value={stats.bestScore}
          icon="🏆"
        />
        <StatCard
          title="Avg Accuracy"
          value={`${stats.averageAccuracy.toFixed(1)}%`}
          icon="🎯"
        />
        <StatCard
          title="Current Streak"
          value={stats.currentStreak}
          icon="🔥"
        />
      </div>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Achievements
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {earnedBadges.length}/{badges.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {earnedBadges.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:scale-105 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
              >
                <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${badge.color} text-2xl`}>
                  {badge.icon}
                </div>
                <p className="text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {badge.name}
                </p>
                <p className="mt-1 text-center text-xs text-gray-600 dark:text-gray-400">
                  {badge.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Top Scores */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Top Scores
          </h3>
        </div>
        <div className="space-y-2">
          {topScores.map((score, index) => (
            <ScoreCard key={`top-${index}-${score.date}`} score={score} rank={index + 1} />
          ))}
        </div>
      </div>

      {/* Recent Scores */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Games
          </h3>
          <button
            onClick={clearScores}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear History
          </button>
        </div>
        <div className="space-y-2">
          {recentScores.map((score, index) => (
            <ScoreCard key={`recent-${index}-${score.date}`} score={score} isRecent />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800"
    >
      <div className="mb-2 flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <span className="text-xl">{icon}</span>
        <span className="text-sm">{title}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </motion.div>
  );
}

function ScoreCard({ 
  score, 
  isRecent = false, 
  rank 
}: { 
  score: QuizScore; 
  isRecent?: boolean; 
  rank?: number;
}) {
  const date = new Date(score.date);
  const formattedDate = date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const accuracy = score.accuracy ?? (score.total > 0 ? (score.score / score.total) * 100 : 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-all hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
    >
      <div className="flex items-center gap-3">
        {rank && (
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold ${
            rank === 1 ? 'bg-yellow-500 text-white' :
            rank === 2 ? 'bg-gray-400 text-white' :
            rank === 3 ? 'bg-orange-500 text-white' :
            'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {rank}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {score.score}/{score.total} 
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              ({accuracy.toFixed(1)}%)
            </span>
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {score.playerName && (
              <span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">
                👤 {score.playerName}
              </span>
            )}
            {formattedDate} • {score.time}s
            {score.streak && score.streak > 1 && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                🔥 Streak: {score.streak}
              </span>
            )}
          </p>
        </div>
      </div>
      {accuracy === 100 && (
        <span className="text-xl">⭐</span>
      )}
    </motion.div>
  );
}

