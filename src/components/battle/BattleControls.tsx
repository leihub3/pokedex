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
  cinematicEnabled?: boolean;
  onToggleCinematic?: (enabled: boolean) => void;
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
  cinematicEnabled = false,
  onToggleCinematic,
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

      {(onSpeedChange || onToggleCinematic) && (
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
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

          {onToggleCinematic && (
            <button
              type="button"
              onClick={() => onToggleCinematic(!cinematicEnabled)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition-colors ${
                cinematicEnabled
                  ? "border-purple-500 bg-purple-600 text-white hover:bg-purple-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <span>Cinematic</span>
              <span
                className={`inline-flex h-4 w-7 items-center rounded-full p-[2px] transition-colors ${
                  cinematicEnabled ? "bg-white/30" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`h-3 w-3 rounded-full bg-white shadow transition-transform ${
                    cinematicEnabled ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

