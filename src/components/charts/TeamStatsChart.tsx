"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { Pokemon } from "@/types/api";

interface TeamStatsChartProps {
  team: Pokemon[];
}

export function TeamStatsChart({ team }: TeamStatsChartProps) {
  const stats = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ];

  const chartData = stats.map((statName) => {
    const statKey = statName.replace("special-", "sp-");
    const total = team.reduce((sum, pokemon) => {
      const stat = pokemon.stats.find((s) => s.stat.name === statName);
      return sum + (stat?.base_stat ?? 0);
    }, 0);
    const average = team.length > 0 ? total / team.length : 0;

    return {
      stat: statKey
        .replace("sp-attack", "Sp. Atk")
        .replace("sp-defense", "Sp. Def")
        .toUpperCase(),
      value: Math.round(average),
      fullMark: 150,
    };
  });

  const totalBaseStats = team.reduce((sum, pokemon) => {
    return sum + pokemon.stats.reduce((s, stat) => s + stat.base_stat, 0);
  }, 0);

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Team Average Stats
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total Base Stats: {totalBaseStats}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fill: "currentColor", fontSize: 12 }}
            className="text-gray-700 dark:text-gray-300"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 150]}
            tick={{ fill: "currentColor", fontSize: 10 }}
            className="text-gray-500 dark:text-gray-400"
          />
          <Radar
            name="Average"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

