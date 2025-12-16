"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { StatusCondition } from "@/battle-engine";

interface StatusEffectsProps {
  status: StatusCondition | null;
}

export function StatusEffects({ status }: StatusEffectsProps) {
  // Respect prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!status || prefersReducedMotion) {
    return null;
  }

  const renderBurnParticles = () => {
    return Array.from({ length: 6 }, (_, i) => (
      <motion.div
        key={`burn-${i}`}
        className="absolute rounded-full bg-red-500"
        style={{
          width: "6px",
          height: "6px",
          left: `${30 + (i % 3) * 20}%`,
          bottom: `${10 + (i % 2) * 15}%`,
          boxShadow: "0 0 8px #FF6B35",
        }}
        animate={{
          y: [-20, -60, -100],
          opacity: [1, 0.8, 0],
          scale: [1, 1.2, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeOut",
        }}
      />
    ));
  };

  const renderPoisonParticles = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <motion.div
        key={`poison-${i}`}
        className="absolute rounded-full bg-purple-500"
        style={{
          width: `${8 + i * 2}px`,
          height: `${8 + i * 2}px`,
          left: `${25 + i * 12}%`,
          bottom: "10%",
          boxShadow: "0 0 10px #A040A0",
        }}
        animate={{
          y: [-30, -70, -110],
          opacity: [1, 0.9, 0],
          scale: [1, 1.3, 0.6],
          x: [-5, 5, -5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: i * 0.25,
          ease: "easeOut",
        }}
      />
    ));
  };

  const renderParalysisParticles = () => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 40;
      return (
        <motion.div
          key={`paralysis-${i}`}
          className="absolute rounded-full bg-yellow-400"
          style={{
            width: "4px",
            height: "4px",
            left: "50%",
            top: "50%",
            boxShadow: "0 0 12px #F8D030",
          }}
          animate={{
            x: [
              Math.cos(angle) * radius * 0.3,
              Math.cos(angle) * radius,
              Math.cos(angle) * radius * 0.3,
            ],
            y: [
              Math.sin(angle) * radius * 0.3,
              Math.sin(angle) * radius,
              Math.sin(angle) * radius * 0.3,
            ],
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      );
    });
  };

  const renderSleepParticles = () => {
    return Array.from({ length: 3 }, (_, i) => (
      <motion.div
        key={`sleep-${i}`}
        className="absolute text-2xl text-blue-400"
        style={{
          left: `${30 + i * 20}%`,
          top: "10%",
          fontSize: `${16 + i * 4}px`,
        }}
        animate={{
          y: [-20, -50],
          opacity: [0, 1, 0.8, 0],
          scale: [0.8, 1, 1.2, 1.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: i * 0.5,
          ease: "easeOut",
        }}
      >
        Z
      </motion.div>
    ));
  };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {status.type === "burn" && renderBurnParticles()}
        {status.type === "poison" && renderPoisonParticles()}
        {status.type === "paralysis" && renderParalysisParticles()}
        {status.type === "sleep" && renderSleepParticles()}
      </AnimatePresence>
    </div>
  );
}



