"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface CriticalHitEffectProps {
  containerWidth: number;
  containerHeight: number;
  position: { x: number; y: number }; // Center position for the effect
  onComplete?: () => void;
  speedMultiplier?: number;
}

interface Star {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

export function CriticalHitEffect({
  containerWidth,
  containerHeight,
  position,
  onComplete,
  speedMultiplier = 1,
}: CriticalHitEffectProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Generate golden stars in a burst pattern
    const starCount = 12;
    const newStars: Star[] = Array.from({ length: starCount }, (_, i) => {
      const angle = (i / starCount) * Math.PI * 2;
      const distance = 60 + Math.random() * 40;
      return {
        id: i,
        angle,
        distance,
        size: 12 + Math.random() * 8,
        delay: i * 0.03,
      };
    });

    setStars(newStars);

    // Complete after animation
    const duration = 800 / speedMultiplier;
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [speedMultiplier, onComplete]);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !isActive || stars.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {stars.map((star) => {
          const endX = position.x + Math.cos(star.angle) * star.distance;
          const endY = position.y + Math.sin(star.angle) * star.distance;

          return (
            <motion.div
              key={star.id}
              className="absolute text-yellow-400"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                fontSize: `${star.size}px`,
              }}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                x: endX - position.x,
                y: endY - position.y,
                scale: [0, 1.5, 1, 0],
                opacity: [0, 1, 1, 0],
                rotate: 360,
              }}
              exit={{
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 0.8 / speedMultiplier,
                delay: star.delay / speedMultiplier,
                times: [0, 0.2, 0.7, 1],
                ease: "easeOut",
              }}
            >
              ★
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}


