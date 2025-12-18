"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface BattleIntroProps {
  pokemon1Name: string;
  pokemon2Name: string;
  pokemon1Sprite: string | null;
  pokemon2Sprite: string | null;
  subtitle?: string;
  roundLabel?: string;
  onComplete: () => void;
}

export function BattleIntro({
  pokemon1Name,
  pokemon2Name,
  pokemon1Sprite,
  pokemon2Sprite,
  subtitle,
  roundLabel,
  onComplete,
}: BattleIntroProps) {
  const [step, setStep] = useState<"countdown" | "go">("countdown");
  const [count, setCount] = useState(3);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Keep latest onComplete in a ref so changing parent handlers don't reset timers
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Run a fixed countdown sequence: 3 -> 2 -> 1 -> GO -> auto-complete
  useEffect(() => {
    if (completedRef.current) return;

    const timeouts: number[] = [];

    // 3 -> 2
    timeouts.push(
      window.setTimeout(() => {
        if (!completedRef.current) setCount(2);
      }, 700)
    );

    // 2 -> 1
    timeouts.push(
      window.setTimeout(() => {
        if (!completedRef.current) setCount(1);
      }, 1400)
    );

    // 1 -> 0 and switch to GO
    timeouts.push(
      window.setTimeout(() => {
        if (!completedRef.current) {
          setCount(0);
          setStep("go");
        }
      }, 2100)
    );

    // Auto-complete shortly after GO
    timeouts.push(
      window.setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current();
        }
      }, 2800)
    );

    return () => {
      timeouts.forEach((id) => clearTimeout(id));
    };
  }, []);

  const handleSkip = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  };

  const renderCenterLabel = () => {
    if (step === "go") {
      return (
        <motion.div
          key="go"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1.1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="text-6xl font-extrabold tracking-tight text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]"
        >
          GO!
        </motion.div>
      );
    }

    return (
      <motion.div
        key={count}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
      >
        {count}
      </motion.div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700 px-5 py-3">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Battle Intro
              </span>
              {subtitle && (
                <span className="text-sm font-semibold text-slate-100">
                  {subtitle}
                </span>
              )}
              {roundLabel && (
                <span className="text-xs text-slate-400">{roundLabel}</span>
              )}
            </div>
            <button
              onClick={handleSkip}
              className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-100 shadow hover:bg-slate-700"
            >
              Skip
            </button>
          </div>

          {/* Content */}
          <div className="relative flex items-center justify-between px-6 py-6">
            {/* Left Pokemon */}
            <div className="flex flex-1 flex-col items-center gap-3">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32">
                {pokemon1Sprite && (
                  <Image
                    src={pokemon1Sprite}
                    alt={pokemon1Name}
                    fill
                    className="object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                    sizes="128px"
                  />
                )}
              </div>
              <div className="rounded-full bg-slate-800/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100">
                {pokemon1Name}
              </div>
            </div>

            {/* Center VS + Countdown */}
            <div className="flex flex-col items-center gap-2 px-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 px-4 py-1 text-xs font-extrabold uppercase tracking-[0.25em] text-white shadow-lg"
              >
                VS
              </motion.div>

              <div className="mt-1 flex h-20 w-24 items-center justify-center sm:w-28">
                <AnimatePresence mode="wait">
                  {renderCenterLabel()}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Pokemon */}
            <div className="flex flex-1 flex-col items-center gap-3">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32">
                {pokemon2Sprite && (
                  <Image
                    src={pokemon2Sprite}
                    alt={pokemon2Name}
                    fill
                    className="object-contain drop-shadow-[0_0_10px_rgba(248,113,113,0.6)]"
                    sizes="128px"
                  />
                )}
              </div>
              <div className="rounded-full bg-slate-800/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100">
                {pokemon2Name}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


