"use client";

import { cn } from "@/lib/utils/cn";

export type SortOption =
  | "id"
  | "name"
  | "base-stats"
  | "height"
  | "weight"
  | "base-experience";

interface SortSelectorProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

export function SortSelector({
  value,
  onChange,
  className,
}: SortSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className={cn(
        "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
        className
      )}
    >
      <option value="id">Sort by ID</option>
      <option value="name">Sort by Name</option>
      <option value="base-stats">Sort by Base Stats</option>
      <option value="height">Sort by Height</option>
      <option value="weight">Sort by Weight</option>
      <option value="base-experience">Sort by Base Experience</option>
    </select>
  );
}

