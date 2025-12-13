import type { Move as APIMove } from "@/types/api";
import { normalizeType, type PokemonType } from "./type";

/**
 * Normalized Move model for battle engine
 */
export interface Move {
  id: number;
  name: string;
  type: PokemonType;
  power: number | null; // null for status moves
  accuracy: number | null; // null for moves that never miss
  priority: number;
  damageClass: "physical" | "special" | "status";
}

/**
 * Normalize a PokéAPI Move to battle engine Move
 */
export function normalizeMove(apiMove: APIMove): Move {
  return {
    id: apiMove.id,
    name: apiMove.name,
    type: normalizeType(apiMove.type.name),
    power: apiMove.power,
    accuracy: apiMove.accuracy,
    priority: apiMove.priority,
    damageClass: apiMove.damage_class.name as "physical" | "special" | "status",
  };
}

/**
 * Check if a move is a damaging move
 */
export function isDamagingMove(move: Move): boolean {
  return move.damageClass !== "status" && move.power !== null;
}

/**
 * Check if a move is a physical move
 */
export function isPhysicalMove(move: Move): boolean {
  return move.damageClass === "physical";
}

/**
 * Check if a move is a special move
 */
export function isSpecialMove(move: Move): boolean {
  return move.damageClass === "special";
}

