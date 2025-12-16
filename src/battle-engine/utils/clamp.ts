/**
 * Clamp a number between a minimum and maximum value
 * @param value - The value to clamp
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new Error("min must be less than or equal to max");
  }
  return Math.max(min, Math.min(max, value));
}



