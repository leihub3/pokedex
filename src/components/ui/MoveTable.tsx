"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "./Badge";
import type { Move } from "@/types/api";

interface MoveTableProps {
  moves: Move[];
}

type SortField = "name" | "power" | "accuracy" | "pp" | "type";
type SortDirection = "asc" | "desc";

export function MoveTable({ moves }: MoveTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [damageClassFilter, setDamageClassFilter] = useState<string>("all");

  const sortedMoves = useMemo(() => {
    let filtered = [...moves];

    // Apply filters
    if (typeFilter !== "all") {
      filtered = filtered.filter((move) => move.type.name === typeFilter);
    }

    if (damageClassFilter !== "all") {
      filtered = filtered.filter(
        (move) => move.damage_class.name === damageClassFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sortField) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "power":
          aValue = a.power ?? 0;
          bValue = b.power ?? 0;
          break;
        case "accuracy":
          aValue = a.accuracy ?? 0;
          bValue = b.accuracy ?? 0;
          break;
        case "pp":
          aValue = a.pp ?? 0;
          bValue = b.pp ?? 0;
          break;
        case "type":
          aValue = a.type.name;
          bValue = b.type.name;
          break;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [moves, sortField, sortDirection, typeFilter, damageClassFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const uniqueTypes = useMemo(() => {
    const types = new Set(moves.map((move) => move.type.name));
    return Array.from(types).sort();
  }, [moves]);

  const uniqueDamageClasses = useMemo(() => {
    const classes = new Set(moves.map((move) => move.damage_class.name));
    return Array.from(classes).sort();
  }, [moves]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="all">All Types</option>
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          value={damageClassFilter}
          onChange={(e) => setDamageClassFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="all">All Damage Classes</option>
          {uniqueDamageClasses.map((damageClass) => (
            <option key={damageClass} value={damageClass}>
              {damageClass}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => handleSort("name")}
              >
                Name <SortIcon field="name" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => handleSort("type")}
              >
                Type <SortIcon field="type" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => handleSort("power")}
              >
                Power <SortIcon field="power" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => handleSort("accuracy")}
              >
                Accuracy <SortIcon field="accuracy" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => handleSort("pp")}
              >
                PP <SortIcon field="pp" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Damage Class
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {sortedMoves.map((move, index) => (
              <motion.tr
                key={move.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="whitespace-nowrap px-4 py-3">
                  <Link
                    href={`/pokemon/moves/${move.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {move.name.replace(/-/g, " ")}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Badge variant="type" typeName={move.type.name}>
                    {move.type.name}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {move.power ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {move.accuracy ? `${move.accuracy}%` : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {move.pp ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                  {move.damage_class.name}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

