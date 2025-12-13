"use client";

interface BattleControlsProps {
  onReset: () => void;
  onAutoPlay?: () => void;
  onPause?: () => void;
  onReplay?: () => void;
  isAutoPlaying?: boolean;
  canReplay?: boolean;
}

export function BattleControls({
  onReset,
  onAutoPlay,
  onPause,
  onReplay,
  isAutoPlaying = false,
  canReplay = false,
}: BattleControlsProps) {
  return (
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
  );
}

