"use client";

import type { AnimationSpeed } from "@/hooks/useBattleAnimation";

interface BattleControlsProps {
  onReset: () => void;
  onAutoPlay?: () => void;
  onPause?: () => void;
  onReplay?: () => void;
  isAutoPlaying?: boolean;
  canReplay?: boolean;
  animationSpeed?: AnimationSpeed;
  onSpeedChange?: (speed: AnimationSpeed) => void;
}

export function BattleControls({
  onReset,
  onAutoPlay,
  onPause,
  onReplay,
  isAutoPlaying = false,
  canReplay = false,
  animationSpeed = 1,
  onSpeedChange,
}: BattleControlsProps) {
  const speedOptions: AnimationSpeed[] = [1, 2, 4];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onAutoPlay && onPause && (
          <>
            {!isAutoPlaying ? (
              <button
                onClick={onAutoPlay}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
              >
                Auto Play
              </button>
            ) : (
              <button
                onClick={onPause}
                className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-yellow-700 hover:shadow-lg"
              >
                Pause
              </button>
            )}
          </>
        )}
        {onReplay && canReplay && (
          <button
            onClick={onReplay}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-green-700 hover:shadow-lg"
          >
            Replay
          </button>
        )}
        <button
          onClick={onReset}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg"
        >
          Reset Battle
        </button>
      </div>

      {onSpeedChange && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Speed:</span>
          <div className="flex gap-1 rounded-lg border border-gray-300 bg-white p-1 dark:border-gray-600 dark:bg-gray-800">
            {speedOptions.map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`rounded px-3 py-1 text-sm font-semibold transition-all ${
                  animationSpeed === speed
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

