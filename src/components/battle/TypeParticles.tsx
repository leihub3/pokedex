"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getParticleConfig,
  generateParticlePath,
  randomBetween,
  type ParticleConfig,
} from "@/lib/utils/typeParticles";

interface TypeParticlesProps {
  type: string;
  fromPosition: "left" | "right";
  toPosition: "left" | "right";
  containerWidth: number;
  containerHeight: number;
  onComplete?: () => void;
  speedMultiplier?: number;
}

interface Particle {
  id: number;
  config: ParticleConfig;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  size: number;
  lifetime: number;
}

export function TypeParticles({
  type,
  fromPosition,
  toPosition,
  containerWidth,
  containerHeight,
  onComplete,
  speedMultiplier = 1,
}: TypeParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Calculate start and end positions based on panel positions
    const centerY = containerHeight / 2;
    // Adjust positioning percentages based on container width (mobile vs desktop)
    // On mobile (narrow containers), Pokemon are closer together, so use different percentages
    const isMobile = containerWidth < 768; // Tailwind's md breakpoint
    const leftX = isMobile ? containerWidth * 0.25 : containerWidth * 0.15; // Left panel center
    const rightX = isMobile ? containerWidth * 0.75 : containerWidth * 0.85; // Right panel center

    const startX = fromPosition === "left" ? leftX : rightX;
    const startY = centerY;
    const endX = toPosition === "left" ? leftX : rightX;
    const endY = centerY;

    const config = getParticleConfig(type);

    // Generate particles
    const newParticles: Particle[] = Array.from({ length: config.count }, (_, i) => {
      const path = generateParticlePath(
        startX,
        startY,
        endX,
        endY,
        config.pattern,
        i,
        config.count
      );

      return {
        id: i,
        config,
        startX,
        startY,
        endX: path.x,
        endY: path.y,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        size: randomBetween(config.size.min, config.size.max),
        lifetime: config.lifetime / speedMultiplier,
      };
    });

    setParticles(newParticles);
    setIsActive(true);

    // Call onComplete after animation finishes
    const maxLifetime = Math.max(...newParticles.map((p) => p.lifetime));
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, maxLifetime);

    return () => clearTimeout(timer);
  }, [type, fromPosition, toPosition, containerWidth, containerHeight, speedMultiplier, onComplete]);

  // Respect prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !isActive || particles.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => {
          const distance = Math.sqrt(
            Math.pow(particle.endX - particle.startX, 2) +
              Math.pow(particle.endY - particle.startY, 2)
          );

          return (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                left: `${particle.startX}px`,
                top: `${particle.startY}px`,
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                x: particle.endX - particle.startX,
                y: particle.endY - particle.startY,
                opacity: [1, 1, 0],
                scale: [1, 1.2, 0],
              }}
              exit={{
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: particle.lifetime / 1000,
                ease: "easeOut",
                times: [0, 0.7, 1],
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

