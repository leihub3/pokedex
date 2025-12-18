"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface BattleCommentaryProps {
  message: string | null;
  onHide?: () => void;
  /** Matches other battle animations (1 = normal, 2 = 2x, 0.5 = slow) */
  speedMultiplier?: number;
}

export function BattleCommentary({
  message,
  onHide,
  speedMultiplier = 1,
}: BattleCommentaryProps) {
  useEffect(() => {
    if (!message) return;

    const baseDurationMs = 2400;
    const duration = baseDurationMs / Math.max(0.5, speedMultiplier);

    const timer = window.setTimeout(() => {
      onHide?.();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [message, speedMultiplier, onHide]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <div className="max-w-xs rounded-full bg-slate-900/90 px-4 py-2 text-center text-xs font-semibold text-slate-50 shadow-lg ring-1 ring-slate-500/40 sm:max-w-md dark:bg-slate-900/95">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


