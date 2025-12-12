"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { Pokemon } from "@/types/api";

interface StatsChartProps {
  pokemon: Pokemon;
}

export function StatsChart({ pokemon }: StatsChartProps) {
  const stats = pokemon.stats.map((stat) => ({
    stat: stat.stat.name
      .replace("special-attack", "Sp. Atk")
      .replace("special-defense", "Sp. Def")
      .toUpperCase(),
    value: stat.base_stat,
    fullMark: 150,
  }));

  return (
    <div className="w-full">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Base Stats
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={stats}>
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
            name="Stats"
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

