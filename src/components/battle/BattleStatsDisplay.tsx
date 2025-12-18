import { motion } from "framer-motion";
import type { BattleStats } from "@/hooks/useBattleStats";

interface BattleStatsDisplayProps {
  stats: BattleStats;
  pokemon1Name?: string;
  pokemon2Name?: string;
  /** Optional current round (for best-of-3 contexts like Elite Four) */
  currentRound?: number;
  /** Optional total rounds (defaults to 3 when currentRound is provided) */
  totalRounds?: number;
  /** Optional round wins (used in Elite Four) */
  roundWins?: { user: number; opponent: number };
  /** Control whether to show the round pill */
  showRoundInfo?: boolean;
  /** Control whether to show the score text */
  showScore?: boolean;
}

export function BattleStatsDisplay({
  stats,
  pokemon1Name = "You",
  pokemon2Name = "Opponent",
  currentRound,
  totalRounds = currentRound ? 3 : undefined,
  roundWins,
  showRoundInfo = true,
  showScore = true,
}: BattleStatsDisplayProps) {
  const turnsLabel =
    stats.totalTurns === 0
      ? "Preparing..."
      : stats.totalTurns === 1
      ? "Turn 1"
      : `${stats.totalTurns} turns`;

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const damageDealt = stats.damageDealt.pokemon0;
  const damageReceived = stats.damageReceived.pokemon0;

  const totalDamage = damageDealt + damageReceived || 1;
  const dealtRatio = Math.min(1, Math.max(0, damageDealt / totalDamage));

  const roundLabel =
    showRoundInfo && currentRound && totalRounds
      ? `Round ${currentRound}/${totalRounds}`
      : undefined;

  const scoreLabel =
    showScore && roundWins != null
      ? `Score: ${roundWins.user} – ${roundWins.opponent}`
      : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-slate-200 bg-slate-50/90 px-4 py-3 text-xs shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            {turnsLabel}
          </span>

          {roundLabel && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
              {roundLabel}
            </span>
          )}

          {scoreLabel && (
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              {scoreLabel}
            </span>
          )}

          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Duration:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-100">
              {formatDuration(stats.battleDuration)}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {pokemon1Name} dmg
            </span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
              {damageDealt}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {pokemon2Name} dmg
            </span>
            <span className="text-sm font-semibold text-rose-600 dark:text-rose-300">
              {damageReceived}
            </span>
          </div>
        </div>
      </div>

      {/* Simple dominance bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-[width]"
          style={{ width: `${dealtRatio * 100}%` }}
        />
      </div>
    </motion.div>
  );
}



