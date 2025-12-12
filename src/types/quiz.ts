/**
 * Quiz types available in the application
 */
export enum QuizType {
  NAME = "name",
  TYPE_EFFECTIVENESS = "type-effectiveness",
  STATS = "stats",
  ABILITY = "ability",
  MOVE = "move",
  POKEDEX = "pokedex",
  GENERATION = "generation",
  HEIGHT_WEIGHT = "height-weight",
  EVOLUTION = "evolution",
  HABITAT = "habitat",
  LEGENDARY = "legendary",
  MOVE_POWER = "move-power",
  CATCH_RATE = "catch-rate",
}

/**
 * Quiz question structure
 */
export interface QuizQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  options: string[];
  metadata?: {
    pokemonId?: number;
    pokemonName?: string;
    type?: string;
    moveName?: string;
    abilityName?: string;
    [key: string]: any;
  };
}

/**
 * Quiz answer structure
 */
export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeTaken: number; // in seconds
}

/**
 * Quiz type metadata for display
 */
export interface QuizTypeMetadata {
  type: QuizType;
  name: string;
  description: string;
  icon: string;
  difficulty: "easy" | "medium" | "hard";
}

/**
 * Quiz type metadata definitions
 */
export const QUIZ_TYPE_METADATA: Record<QuizType, QuizTypeMetadata> = {
  [QuizType.NAME]: {
    type: QuizType.NAME,
    name: "Name Quiz",
    description: "Identify the Pokemon from its silhouette",
    icon: "🎭",
    difficulty: "easy",
  },
  [QuizType.TYPE_EFFECTIVENESS]: {
    type: QuizType.TYPE_EFFECTIVENESS,
    name: "Type Effectiveness",
    description: "What type is super effective against X?",
    icon: "⚡",
    difficulty: "medium",
  },
  [QuizType.STATS]: {
    type: QuizType.STATS,
    name: "Stats Quiz",
    description: "Which Pokemon has the highest stat?",
    icon: "📊",
    difficulty: "hard",
  },
  [QuizType.ABILITY]: {
    type: QuizType.ABILITY,
    name: "Ability Quiz",
    description: "Which Pokemon has this ability?",
    icon: "✨",
    difficulty: "hard",
  },
  [QuizType.MOVE]: {
    type: QuizType.MOVE,
    name: "Move Quiz",
    description: "What type is this move?",
    icon: "💫",
    difficulty: "medium",
  },
  [QuizType.POKEDEX]: {
    type: QuizType.POKEDEX,
    name: "Pokedex Quiz",
    description: "Identify Pokemon from Pokedex description",
    icon: "📖",
    difficulty: "hard",
  },
  [QuizType.GENERATION]: {
    type: QuizType.GENERATION,
    name: "Generation Quiz",
    description: "Which generation does this Pokemon belong to?",
    icon: "🌟",
    difficulty: "medium",
  },
  [QuizType.HEIGHT_WEIGHT]: {
    type: QuizType.HEIGHT_WEIGHT,
    name: "Height & Weight",
    description: "Which Pokemon is tallest/heaviest?",
    icon: "📏",
    difficulty: "medium",
  },
  [QuizType.EVOLUTION]: {
    type: QuizType.EVOLUTION,
    name: "Evolution Quiz",
    description: "What does this Pokemon evolve into?",
    icon: "🔄",
    difficulty: "medium",
  },
  [QuizType.HABITAT]: {
    type: QuizType.HABITAT,
    name: "Habitat Quiz",
    description: "Which Pokemon lives in this habitat?",
    icon: "🌍",
    difficulty: "hard",
  },
  [QuizType.LEGENDARY]: {
    type: QuizType.LEGENDARY,
    name: "Legendary Quiz",
    description: "Which is a Legendary/Mythical Pokemon?",
    icon: "👑",
    difficulty: "easy",
  },
  [QuizType.MOVE_POWER]: {
    type: QuizType.MOVE_POWER,
    name: "Move Power",
    description: "Which move has the highest power?",
    icon: "💥",
    difficulty: "hard",
  },
  [QuizType.CATCH_RATE]: {
    type: QuizType.CATCH_RATE,
    name: "Catch Rate",
    description: "Which Pokemon has the lowest capture rate?",
    icon: "🎣",
    difficulty: "hard",
  },
};

