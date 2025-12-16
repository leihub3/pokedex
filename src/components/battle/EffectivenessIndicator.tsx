"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getEffectivenessText, type Effectiveness } from "@/lib/utils/battleHelpers";

interface EffectivenessIndicatorProps {
  effectiveness: Effectiveness;
  speedMultiplier?: number;
}

export function EffectivenessIndicator({
  effectiveness,
  speedMultiplier = 1,
}: EffectivenessIndicatorProps) {
  const { text, color, scale } = getEffectivenessText(effectiveness);

  // Don't show for normal effectiveness (1x)
  if (!text || effectiveness === 1) {
    return null;
  }

  // Respect prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const displayDuration = 2000 / speedMultiplier; // 2 seconds adjusted for speed

  return (
    <AnimatePresence>
      <motion.div
        className="pointer-events-none"
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.8,
        }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [20, 0, -10, -20],
          scale: [0.8, scale, scale * 1.05, scale * 0.9],
        }}
        exit={{
          opacity: 0,
          y: -30,
          scale: 0.8,
        }}
        transition={{
          duration: prefersReducedMotion ? 0.1 : displayDuration / 1000,
          times: [0, 0.1, 0.8, 1],
          ease: "easeOut",
        }}
        style={{
          color,
          textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
          filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`,
        }}
      >
        <motion.p
          className="whitespace-nowrap text-xl font-bold sm:text-2xl text-center"
          style={{ 
            wordBreak: 'keep-all',
            overflowWrap: 'normal',
          }}
          animate={
            effectiveness === 0 && !prefersReducedMotion
              ? {
                  x: [-5, 5, -5, 5, 0],
                }
              : effectiveness >= 2 && !prefersReducedMotion
              ? {
                  y: [0, -5, 0],
                }
              : {}
          }
          transition={{
            duration: 0.3,
            repeat: effectiveness === 0 ? 3 : effectiveness >= 2 ? 2 : 0,
            ease: "easeInOut",
          }}
        >
          {text}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}

