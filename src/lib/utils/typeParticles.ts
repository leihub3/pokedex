/**
 * Type-based particle effect configurations
 * Defines particle patterns, colors, and behaviors for each Pokémon type
 */

export interface ParticleConfig {
  count: number;
  colors: string[];
  pattern: "scatter" | "linear" | "burst" | "rising" | "orbital";
  size: { min: number; max: number };
  speed: { min: number; max: number };
  lifetime: number; // in milliseconds
}

const TYPE_COLORS: Record<string, string[]> = {
  normal: ["#A8A878", "#C0C098"],
  fire: ["#F08030", "#FF6B35", "#FF8C42", "#FFA500"],
  water: ["#6890F0", "#5AA9E6", "#7EC8E3", "#87CEEB"],
  electric: ["#F8D030", "#FFD700", "#FFED4E", "#FFF700"],
  grass: ["#78C850", "#9ACD32", "#90EE90", "#98FB98"],
  ice: ["#98D8D8", "#B0E0E6", "#E0F6FF", "#F0FFFF"],
  fighting: ["#C03028", "#DC143C", "#FF6347", "#FF7F50"],
  poison: ["#A040A0", "#9370DB", "#BA55D3", "#DA70D6"],
  ground: ["#E0C068", "#D2B48C", "#DEB887", "#F4A460"],
  flying: ["#A890F0", "#9370DB", "#BA55D3", "#DDA0DD"],
  psychic: ["#F85888", "#FF69B4", "#FF1493", "#FFC0CB"],
  bug: ["#A8B820", "#9ACD32", "#ADFF2F", "#7FFF00"],
  rock: ["#B8A038", "#CD853F", "#D2B48C", "#DEB887"],
  ghost: ["#705898", "#9370DB", "#8A2BE2", "#9932CC"],
  dragon: ["#7038F8", "#4169E1", "#6A5ACD", "#9370DB"],
  dark: ["#705848", "#696969", "#778899", "#708090"],
  steel: ["#B8B8D0", "#C0C0C0", "#D3D3D3", "#DCDCDC"],
  fairy: ["#EE99AC", "#FFB6C1", "#FFC0CB", "#FFDAB9"],
};

/**
 * Get particle configuration for a Pokémon type
 */
export function getParticleConfig(type: string): ParticleConfig {
  const normalizedType = type.toLowerCase();
  const colors = TYPE_COLORS[normalizedType] || TYPE_COLORS.normal;

  // Type-specific configurations
  const configs: Record<string, ParticleConfig> = {
    fire: {
      count: 12,
      colors,
      pattern: "scatter",
      size: { min: 4, max: 8 },
      speed: { min: 100, max: 200 },
      lifetime: 600,
    },
    water: {
      count: 8,
      colors,
      pattern: "linear",
      size: { min: 6, max: 12 },
      speed: { min: 80, max: 150 },
      lifetime: 700,
    },
    electric: {
      count: 15,
      colors,
      pattern: "burst",
      size: { min: 3, max: 6 },
      speed: { min: 150, max: 250 },
      lifetime: 400,
    },
    grass: {
      count: 10,
      colors,
      pattern: "rising",
      size: { min: 5, max: 10 },
      speed: { min: 60, max: 120 },
      lifetime: 800,
    },
    ice: {
      count: 8,
      colors,
      pattern: "burst",
      size: { min: 4, max: 8 },
      speed: { min: 70, max: 140 },
      lifetime: 600,
    },
    psychic: {
      count: 12,
      colors,
      pattern: "orbital",
      size: { min: 4, max: 7 },
      speed: { min: 90, max: 180 },
      lifetime: 650,
    },
    poison: {
      count: 9,
      colors,
      pattern: "rising",
      size: { min: 5, max: 9 },
      speed: { min: 70, max: 130 },
      lifetime: 700,
    },
    flying: {
      count: 10,
      colors,
      pattern: "linear",
      size: { min: 4, max: 8 },
      speed: { min: 100, max: 200 },
      lifetime: 550,
    },
    default: {
      count: 8,
      colors,
      pattern: "scatter",
      size: { min: 4, max: 8 },
      speed: { min: 80, max: 160 },
      lifetime: 600,
    },
  };

  return configs[normalizedType] || configs.default;
}

/**
 * Generate particle trajectory path
 * Returns start and end positions for a particle based on pattern
 */
export function generateParticlePath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  pattern: ParticleConfig["pattern"],
  index: number,
  total: number
): { x: number; y: number; controlX?: number; controlY?: number } {
  const baseAngle = Math.atan2(endY - startY, endX - startX);
  const distance = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );

  switch (pattern) {
    case "linear":
      // Particles travel in a straight line with slight variance
      const variance = (index / total - 0.5) * 30; // -15 to +15 pixels
      const perpAngle = baseAngle + Math.PI / 2;
      return {
        x: startX + Math.cos(baseAngle) * distance + Math.cos(perpAngle) * variance,
        y: startY + Math.sin(baseAngle) * distance + Math.sin(perpAngle) * variance,
      };

    case "scatter":
      // Particles scatter in a cone shape
      const scatterAngle = baseAngle + (index / total - 0.5) * Math.PI * 0.6; // ±54 degrees
      const scatterDistance = distance * (0.8 + (index % 3) * 0.2); // Vary distance
      return {
        x: startX + Math.cos(scatterAngle) * scatterDistance,
        y: startY + Math.sin(scatterAngle) * scatterDistance,
      };

    case "burst":
      // Particles burst outward in all directions
      const burstAngle = (index / total) * Math.PI * 2;
      const burstDistance = distance * 0.7;
      return {
        x: startX + Math.cos(baseAngle + burstAngle) * burstDistance,
        y: startY + Math.sin(baseAngle + burstAngle) * burstDistance,
      };

    case "rising":
      // Particles rise while moving forward
      const riseAmount = (index / total) * 40; // Rise 0-40 pixels
      return {
        x: startX + Math.cos(baseAngle) * distance,
        y: startY + Math.sin(baseAngle) * distance - riseAmount,
      };

    case "orbital":
      // Particles orbit around the path
      const orbitalAngle = baseAngle + (index / total) * Math.PI * 2;
      const orbitalRadius = 20 + (index % 3) * 5;
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      return {
        x: midX + Math.cos(orbitalAngle) * orbitalRadius,
        y: midY + Math.sin(orbitalAngle) * orbitalRadius,
        controlX: endX,
        controlY: endY,
      };

    default:
      return { x: endX, y: endY };
  }
}

/**
 * Get a random value between min and max
 */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

