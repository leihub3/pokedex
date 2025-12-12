import { getAllPokemonList, getPokemonById } from "@/lib/api/pokemon";
import { getRandomType, getAllTypes } from "@/lib/api/quizData";
import type { Pokemon, PokemonListItem } from "@/types/api";
import type { QuizQuestion } from "@/types/quiz";

/**
 * Shuffle an array randomly (Fisher-Yates algorithm)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random element from array
 */
export function getRandomElement<T>(array: T[]): T | null {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get multiple random elements from array (without duplicates)
 */
export function getRandomElements<T>(array: T[], count: number): T[] {
  if (array.length === 0 || count === 0) return [];
  if (count >= array.length) return shuffleArray(array);

  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
}

/**
 * Generate wrong answers for Pokemon name quiz
 */
export async function generateWrongPokemonNames(
  correctName: string,
  count: number = 3
): Promise<string[]> {
  try {
    const allPokemon = await getAllPokemonList();
    const wrongAnswers: string[] = [];

    while (wrongAnswers.length < count && wrongAnswers.length < allPokemon.results.length - 1) {
      const randomPokemon = getRandomElement(allPokemon.results);
      if (randomPokemon && randomPokemon.name !== correctName && !wrongAnswers.includes(randomPokemon.name)) {
        wrongAnswers.push(randomPokemon.name);
      }
    }

    return wrongAnswers;
  } catch (error) {
    console.error("Error generating wrong Pokemon names:", error);
    return [];
  }
}

/**
 * Generate wrong answers for type quiz
 */
export async function generateWrongTypes(correctType: string, count: number = 3): Promise<string[]> {
  try {
    const allTypes = await getAllTypes();
    const wrongAnswers: string[] = [];

    while (wrongAnswers.length < count && wrongAnswers.length < allTypes.length - 1) {
      const randomType = getRandomElement(allTypes);
      if (randomType && randomType !== correctType && !wrongAnswers.includes(randomType)) {
        wrongAnswers.push(randomType);
      }
    }

    return wrongAnswers;
  } catch (error) {
    console.error("Error generating wrong types:", error);
    return [];
  }
}

/**
 * Format Pokemon name for display (capitalize, replace hyphens)
 */
export function formatPokemonName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Format type name for display
 */
export function formatTypeName(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Get stat name from stat object
 */
export function getStatName(statName: string): string {
  const statNames: Record<string, string> = {
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    "special-attack": "Sp. Attack",
    "special-defense": "Sp. Defense",
    speed: "Speed",
  };
  return statNames[statName] || statName;
}

/**
 * Get Pokemon stat value
 */
export function getPokemonStat(pokemon: Pokemon, statName: string): number {
  const stat = pokemon.stats.find((s) => s.stat.name === statName);
  return stat?.base_stat || 0;
}

/**
 * Generate question ID
 */
export function generateQuestionId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create quiz question from data
 */
export function createQuizQuestion(
  question: string,
  correctAnswer: string,
  options: string[],
  metadata?: QuizQuestion["metadata"]
): QuizQuestion {
  return {
    id: generateQuestionId(),
    question,
    correctAnswer,
    options: shuffleArray(options),
    metadata,
  };
}

/**
 * Truncate flavor text for quiz (remove line breaks, limit length)
 */
export function truncateFlavorText(text: string, maxLength: number = 150): string {
  // Remove line breaks and extra spaces
  const cleaned = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  
  if (cleaned.length <= maxLength) return cleaned;
  
  // Try to cut at a sentence end
  const truncated = cleaned.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  const lastExclamation = truncated.lastIndexOf("!");
  const lastQuestion = truncated.lastIndexOf("?");
  
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  return truncated + "...";
}

