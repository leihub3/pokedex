import { useState, useEffect, useCallback } from "react";
import { QuizType } from "@/types/quiz";
import { useQuizStore } from "@/store/quizStore";

interface UseBaseQuizOptions {
  quizType: QuizType;
  onQuestionLoad: () => Promise<void>;
  timeLimit?: number; // in seconds
}

export function useBaseQuiz({ quizType, onQuestionLoad, timeLimit = 30 }: UseBaseQuizOptions) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isGameActive, setIsGameActive] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { addScore, playerName: storedName } = useQuizStore();

  // Timer effect
  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive]);

  // Handle game end when time runs out
  useEffect(() => {
    if (isGameActive && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, isGameActive]);

  const startGame = useCallback(() => {
    setIsGameActive(true);
    setScore(0);
    setRound(0);
    setTimeLeft(timeLimit);
    setSelectedAnswer(null);
    loadNewQuestion();
  }, [timeLimit]);

  const loadNewQuestion = useCallback(async () => {
    setIsLoading(true);
    setSelectedAnswer(null);
    try {
      await onQuestionLoad();
    } catch (error) {
      console.error("Error loading question:", error);
    } finally {
      setIsLoading(false);
    }
  }, [onQuestionLoad]);

  const handleAnswer = useCallback(
    (answer: string, isCorrect: boolean) => {
      if (selectedAnswer !== null) return; // Already answered

      setSelectedAnswer(answer);

      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      // Move to next question after delay
      setTimeout(() => {
        setRound((prev) => prev + 1);
        loadNewQuestion();
      }, 1500);
    },
    [selectedAnswer, loadNewQuestion]
  );

  const endGame = useCallback(() => {
    setIsGameActive(false);
    const totalQuestions = round + 1;
    const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    const timeUsed = timeLimit - timeLeft;

    addScore({
      score,
      total: totalQuestions,
      time: timeUsed,
      date: new Date().toISOString(),
      accuracy,
      quizType,
      playerName: storedName || undefined,
    });
  }, [round, score, timeLeft, timeLimit, quizType, addScore, storedName]);

  return {
    score,
    round,
    timeLeft,
    isGameActive,
    selectedAnswer,
    isLoading,
    startGame,
    handleAnswer,
    endGame,
    loadNewQuestion,
  };
}

