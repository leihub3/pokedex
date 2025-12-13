/**
 * Status condition types
 */
export type StatusCondition =
  | { type: "burn" }
  | { type: "poison" }
  | { type: "paralysis" }
  | { type: "sleep"; turnsRemaining: number };

/**
 * Check if a Pokemon has a status condition
 */
export function hasStatus(status: StatusCondition | null): boolean {
  return status !== null;
}

/**
 * Check if status is a specific type
 */
export function isStatus(
  status: StatusCondition | null,
  type: "burn" | "poison" | "paralysis" | "sleep"
): boolean {
  if (!status) return false;
  if (type === "sleep") {
    return status.type === "sleep";
  }
  return status.type === type;
}

/**
 * Clone status condition
 */
export function cloneStatus(status: StatusCondition | null): StatusCondition | null {
  if (!status) return null;
  if (status.type === "sleep") {
    return { type: "sleep", turnsRemaining: status.turnsRemaining };
  }
  return { type: status.type };
}

