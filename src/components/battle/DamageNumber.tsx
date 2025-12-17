"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface DamageNumberProps {
  damage: number;
  isCritical?: boolean;
  isHealing?: boolean;
  position?: { x: number; y: number };
  onComplete?: () => void;
}

export function DamageNumber({
  damage,
  isCritical = false,
  isHealing = false,
  position = { x: 0, y: 0 },
  onComplete,
}: DamageNumberProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  // Scale size based on damage amount and critical
  const baseSize = isCritical ? 48 : 32;
  const damageSize = Math.min(baseSize + Math.log10(damage) * 8, 72);
  
  const color = isHealing
    ? "text-green-500"
    : isCritical
    ? "text-yellow-400"
    : "text-white";

  const shadowColor = isHealing
    ? "drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
    : isCritical
    ? "drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]"
    : "drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]";

  return (
    <motion.div
      initial={{
        x: position.x,
        y: position.y,
        scale: 0.5,
        opacity: 0,
      }}
      animate={{
        x: position.x,
        y: position.y - 60,
        scale: isCritical ? [0.8, 1.3, 1.0] : 1.0,
        opacity: [0, 1, 1, 0],
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
      }}
      transition={{
        duration: 1.5,
        times: [0, 0.2, 0.8, 1],
        ease: "easeOut",
      }}
      className={`pointer-events-none absolute z-50 font-bold ${color} ${shadowColor}`}
      style={{
        fontSize: `${damageSize}px`,
        textShadow: isCritical
          ? "2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(250,204,21,0.6)"
          : "2px 2px 4px rgba(0,0,0,0.8)",
        fontWeight: isCritical ? 900 : 700,
      }}
    >
      {isCritical && "★ "}
      {isHealing ? "+" : "-"}
      {damage}
      {isCritical && " ★"}
    </motion.div>
  );
}

