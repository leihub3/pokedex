"use client";

import { QuizType } from "@/types/quiz";
import {
  NameQuiz,
  TypeEffectivenessQuiz,
  StatsQuiz,
  AbilityQuiz,
  MoveQuiz,
  PokedexQuiz,
  GenerationQuiz,
  HeightWeightQuiz,
  EvolutionQuiz,
  HabitatQuiz,
  LegendaryQuiz,
  MovePowerQuiz,
  CatchRateQuiz,
} from "./types";

interface QuizRendererProps {
  quizType: QuizType;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  selectedAnswer: string | null;
  isLoading: boolean;
  round: number; // Pass round to trigger question reload
}

export function QuizRenderer({
  quizType,
  onAnswer,
  selectedAnswer,
  isLoading,
  round,
}: QuizRendererProps) {
  const quizProps = {
    onAnswer,
    selectedAnswer,
    isLoading,
    round,
  };

  switch (quizType) {
    case QuizType.NAME:
      return <NameQuiz {...quizProps} />;
    case QuizType.TYPE_EFFECTIVENESS:
      return <TypeEffectivenessQuiz {...quizProps} />;
    case QuizType.STATS:
      return <StatsQuiz {...quizProps} />;
    case QuizType.ABILITY:
      return <AbilityQuiz {...quizProps} />;
    case QuizType.MOVE:
      return <MoveQuiz {...quizProps} />;
    case QuizType.POKEDEX:
      return <PokedexQuiz {...quizProps} />;
    case QuizType.GENERATION:
      return <GenerationQuiz {...quizProps} />;
    case QuizType.HEIGHT_WEIGHT:
      return <HeightWeightQuiz {...quizProps} />;
    case QuizType.EVOLUTION:
      return <EvolutionQuiz {...quizProps} />;
    case QuizType.HABITAT:
      return <HabitatQuiz {...quizProps} />;
    case QuizType.LEGENDARY:
      return <LegendaryQuiz {...quizProps} />;
    case QuizType.MOVE_POWER:
      return <MovePowerQuiz {...quizProps} />;
    case QuizType.CATCH_RATE:
      return <CatchRateQuiz {...quizProps} />;
    default:
      return <div>Unknown quiz type</div>;
  }
}

