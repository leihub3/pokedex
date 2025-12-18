import type { BattleStats } from "@/hooks/useBattleStats";

export interface BattleSummaryInput {
  stats: BattleStats;
  /** Player index in the underlying battle-engine (0 = user in our current flows) */
  playerIndex: 0 | 1;
  /** Winner index from battle engine, or null if draw */
  winnerIndex: 0 | 1 | null;
}

export interface CompactBattleSnapshot {
  totalTurns: number;
  damageDealt: number;
  damageReceived: number;
  battleDuration: number;
}

export interface BattleAnalysisResult {
  primaryMessage: string;
  secondaryMessages: string[];
  achievements: string[];
  ratingStars: number; // 1–5
  ratingScore: number; // 0–100
  comparisonMessages: string[];
}

export function createSnapshot(input: BattleSummaryInput): CompactBattleSnapshot {
  const { stats } = input;
  return {
    totalTurns: stats.totalTurns,
    damageDealt: stats.damageDealt.pokemon0,
    damageReceived: stats.damageReceived.pokemon0,
    battleDuration: stats.battleDuration,
  };
}

function getFinalHpFractions(stats: BattleStats): { player: number; opponent: number } {
  const lastPoint = stats.hpHistory[stats.hpHistory.length - 1];
  if (!lastPoint) {
    return { player: 1, opponent: 1 };
  }
  // In our usage, pokemon0 is always the player, pokemon1 the opponent
  const player = lastPoint.pokemon0;
  const opponent = lastPoint.pokemon1;
  // We don't know maxHP here, so approximate using the first point in history
  const firstPoint = stats.hpHistory[0] ?? lastPoint;
  const maxPlayer = firstPoint.pokemon0 || 1;
  const maxOpponent = firstPoint.pokemon1 || 1;
  return {
    player: maxPlayer > 0 ? player / maxPlayer : 0,
    opponent: maxOpponent > 0 ? opponent / maxOpponent : 0,
  };
}

function detectComeback(stats: BattleStats): boolean {
  if (stats.hpHistory.length < 2) return false;
  let wasBehind = false;
  for (const point of stats.hpHistory) {
    if (point.pokemon0 < point.pokemon1) {
      wasBehind = true;
      break;
    }
  }
  return wasBehind;
}

function buildAchievements(input: BattleSummaryInput): string[] {
  const { stats, winnerIndex, playerIndex } = input;
  const achievements: string[] = [];
  const playerWon = winnerIndex === playerIndex;

  // Fast Victory
  if (playerWon && stats.totalTurns < 3) {
    achievements.push("Fast Victory");
  }

  // Perfect Defense
  if (playerWon && stats.damageReceived.pokemon0 === 0) {
    achievements.push("Perfect Defense");
  }

  // Comeback King
  if (playerWon && detectComeback(stats)) {
    achievements.push("Comeback King");
  }

  // Type Master
  const superEffectiveCount = stats.effectivenessCounts.get(2) || 0;
  if (superEffectiveCount >= 5) {
    achievements.push("Type Master");
  }

  // Critical Master
  const totalCrits = stats.criticalHits.pokemon0 + stats.criticalHits.pokemon1;
  if (totalCrits >= 3) {
    achievements.push("Critical Master");
  }

  return achievements;
}

function buildPrimaryMessage(input: BattleSummaryInput): string {
  const { stats, winnerIndex, playerIndex } = input;
  const playerWon = winnerIndex === playerIndex;
  const { player: playerHpFrac, opponent: opponentHpFrac } = getFinalHpFractions(stats);

  if (playerWon) {
    if (stats.totalTurns < 3) {
      return "Victory by a landslide!";
    }
    if (playerHpFrac < 0.1) {
      return "You pulled off a clutch victory!";
    }
    if (playerHpFrac < 0.25) {
      return "Victory, but it was a close call!";
    }
    if (stats.damageReceived.pokemon0 === 0) {
      return "Perfect battle!";
    }
    if (detectComeback(stats)) {
      return "Comeback victory!";
    }
    return "Solid victory!";
  } else {
    if (stats.totalTurns < 3) {
      return "Swift defeat...";
    }
    if (opponentHpFrac < 0.25) {
      return "So close! Just a bit more damage and you had it.";
    }
    if (stats.damageDealt.pokemon0 === 0) {
      return "A rough loss — you couldn’t land a solid hit.";
    }
    return "Defeat this time, but valuable data for next run.";
  }
}

function buildSecondaryMessages(input: BattleSummaryInput): string[] {
  const { stats, winnerIndex, playerIndex } = input;
  const messages: string[] = [];
  const playerWon = winnerIndex === playerIndex;
  const totalDamage = stats.damageDealt.pokemon0 + stats.damageReceived.pokemon0;
  const damageRatio =
    totalDamage > 0 ? stats.damageDealt.pokemon0 / totalDamage : 0.5;
  const superEffectiveCount = stats.effectivenessCounts.get(2) || 0;

  if (playerWon && stats.totalTurns < 3) {
    messages.push("You overwhelmed your opponent before they could react.");
  }

  if (damageRatio >= 0.7) {
    messages.push("You won the damage race convincingly.");
  } else if (damageRatio <= 0.4) {
    messages.push("The opponent dealt significantly more damage overall.");
  }

  if (superEffectiveCount >= 3) {
    messages.push("You repeatedly hit for super-effective damage.");
  } else if (superEffectiveCount === 0) {
    messages.push("You never hit super-effectively — consider your type matchups.");
  }

  return messages;
}

function computeRating(input: BattleSummaryInput, achievements: string[]): {
  score: number;
  stars: number;
} {
  const { stats, winnerIndex, playerIndex } = input;
  const playerWon = winnerIndex === playerIndex;
  const superEffectiveCount = stats.effectivenessCounts.get(2) || 0;
  const totalDamage = stats.damageDealt.pokemon0 + stats.damageReceived.pokemon0;
  const damageRatio =
    totalDamage > 0 ? stats.damageDealt.pokemon0 / totalDamage : 0.5;

  let score = 0;

  // Base on win/loss
  score += playerWon ? 40 : 15;

  // Efficiency: fewer turns is better (cap at 10+)
  const efficiency = 1 / Math.max(1, Math.min(10, stats.totalTurns));
  score += efficiency * 20;

  // Damage ratio (attack vs defense)
  score += damageRatio * 20;

  // Type usage
  const typeScore = Math.min(superEffectiveCount, 5) / 5;
  score += typeScore * 10;

  // Achievements bonus
  score += Math.min(achievements.length * 5, 20);

  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const stars = Math.max(1, Math.min(5, Math.round((clampedScore / 100) * 5)));

  return { score: clampedScore, stars };
}

function buildComparisonMessages(
  current: CompactBattleSnapshot,
  previous?: CompactBattleSnapshot | null
): string[] {
  if (!previous) return [];
  const messages: string[] = [];

  const turnDiff = previous.totalTurns - current.totalTurns;
  if (turnDiff >= 2) {
    messages.push(`Finished ${turnDiff} turns faster than your last battle!`);
  } else if (turnDiff <= -2) {
    messages.push(`This battle took ${Math.abs(turnDiff)} more turns than last time.`);
  }

  const damageDiff = current.damageDealt - previous.damageDealt;
  if (damageDiff >= 50) {
    messages.push(`You dealt ${damageDiff} more damage than in your previous battle.`);
  } else if (damageDiff <= -50) {
    messages.push(
      `You dealt ${Math.abs(damageDiff)} less damage than in your previous battle.`
    );
  }

  const receivedDiff = previous.damageReceived - current.damageReceived;
  if (receivedDiff >= 50) {
    messages.push(
      `You tanked ${receivedDiff} less damage than last time — your defenses improved.`
    );
  } else if (receivedDiff <= -50) {
    messages.push(
      `You took ${Math.abs(receivedDiff)} more damage than last time — watch your defenses.`
    );
  }

  return messages;
}

export function analyzeBattle(
  input: BattleSummaryInput,
  previousSnapshot?: CompactBattleSnapshot | null
): BattleAnalysisResult {
  const achievements = buildAchievements(input);
  const primaryMessage = buildPrimaryMessage(input);
  const secondaryMessages = buildSecondaryMessages(input);
  const { score, stars } = computeRating(input, achievements);
  const currentSnapshot = createSnapshot(input);
  const comparisonMessages = buildComparisonMessages(currentSnapshot, previousSnapshot);

  return {
    primaryMessage,
    secondaryMessages,
    achievements,
    ratingStars: stars,
    ratingScore: score,
    comparisonMessages,
  };
}


