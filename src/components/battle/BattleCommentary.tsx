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

    // Shorter display time; longer messages disappear a bit faster
    const baseDurationMs = message.length > 30 ? 1400 : 1900;
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
          initial={{ opacity: 0, y: 16, scale: 0.8, rotate: -4 }}
          animate={{
            opacity: 1,
            y: [16, -4, 0],
            scale: [0.9, 1.08, 1],
            rotate: [-4, 3, 0],
          }}
          exit={{ opacity: 0, y: -16, scale: 0.9, rotate: 3 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <motion.div
            className="max-w-xs rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 px-4 py-2 text-center text-xs font-semibold text-slate-900 shadow-xl sm:max-w-md dark:from-amber-300 dark:via-pink-300 dark:to-indigo-300"
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.95, 1.05, 1] }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <span className="mr-1 align-middle">✨</span>
            <span className="align-middle">{message}</span>
            <span className="ml-1 align-middle">✨</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


