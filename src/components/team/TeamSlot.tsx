"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Pokemon } from "@/types/api";

interface TeamSlotProps {
  pokemon: Pokemon | null;
  slot: number;
  onRemove: () => void;
  onDrop: (pokemon: Pokemon) => void;
  onSlotClick?: () => void;
  isDragging: boolean;
  onDragStart: (slot: number) => void;
  onDragEnd: () => void;
  isMobile?: boolean;
  isSelectedForMobile?: boolean;
}

export function TeamSlot({
  pokemon,
  slot,
  onRemove,
  onDrop,
  onSlotClick,
  isDragging,
  onDragStart,
  onDragEnd,
  isMobile = false,
  isSelectedForMobile = false,
}: TeamSlotProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (!isMobile) {
      e.preventDefault();
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    if (!isMobile) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isMobile) {
      e.preventDefault();
      setIsDragOver(false);
      const pokemonData = e.dataTransfer.getData("application/json");
      if (pokemonData) {
        try {
          const pokemon: Pokemon = JSON.parse(pokemonData);
          onDrop(pokemon);
        } catch (error) {
          console.error("Error parsing dropped pokemon:", error);
        }
      }
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isMobile && pokemon) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("application/json", JSON.stringify(pokemon));
      onDragStart(slot);
    }
  };

  const handleDragEndNative = () => {
    if (!isMobile) {
      onDragEnd();
    }
  };

  const handleClick = () => {
    if (isMobile && onSlotClick && !pokemon && isSelectedForMobile) {
      onSlotClick();
    }
  };

  const imageUrl =
    pokemon?.sprites.other["official-artwork"].front_default ||
    pokemon?.sprites.front_default ||
    "";

  return (
    <div
      draggable={!isMobile && !!pokemon}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEndNative}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative min-h-[200px] rounded-lg border-2 border-dashed p-4 transition-all ${
        isDragOver
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : pokemon
          ? "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800"
          : isSelectedForMobile && isMobile
          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 cursor-pointer"
          : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
      } ${isDragging ? "opacity-50" : ""} ${
        pokemon && !isMobile ? "cursor-move hover:scale-105" : ""
      }`}
    >
      {pokemon ? (
        <div className="flex flex-col items-center space-y-2">
          {imageUrl && (
            <div className="relative h-20 w-20">
              <Image
                src={imageUrl}
                alt={pokemon.name}
                fill
                className="object-contain"
                sizes="80px"
              />
            </div>
          )}
          <Link href={`/pokemon/${pokemon.id}`}>
            <h3 className="text-center font-semibold capitalize text-gray-900 dark:text-gray-100">
              {pokemon.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            #{String(pokemon.id).padStart(3, "0")}
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            {pokemon.types.map((type) => (
              <Badge
                key={type.slot}
                variant="type"
                typeName={type.type.name}
                className="text-xs"
              >
                {type.type.name}
              </Badge>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="mt-2 rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="text-center text-sm text-gray-500 dark:text-gray-500">
            Slot {slot + 1}
            <br />
            <span className="text-xs">
              {isMobile && isSelectedForMobile
                ? "Tap to place Pokémon"
                : "Drop Pokémon here"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

