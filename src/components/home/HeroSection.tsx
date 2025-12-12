"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { getPokemonById } from "@/lib/api/pokemon";
import type { Pokemon } from "@/types/api";

const featuredPokemonIds = [25, 6, 1, 150]; // Pikachu, Charizard, Bulbasaur, Mewtwo

interface Particle {
  width: number;
  height: number;
  left: string;
  top: string;
  duration: number;
  delay: number;
}

export function HeroSection() {
  const [featuredPokemon, setFeaturedPokemon] = useState<Pokemon | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Generate particle positions only on client side to avoid hydration mismatch
  const particles = useMemo<Particle[]>(() => {
    if (!isMounted) return [];
    return Array.from({ length: 20 }, () => ({
      width: Math.random() * 100 + 50,
      height: Math.random() * 100 + 50,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
  }, [isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadPokemon = async () => {
      setIsLoading(true);
      try {
        const pokemon = await getPokemonById(featuredPokemonIds[currentIndex]);
        setFeaturedPokemon(pokemon);
      } catch (error) {
        console.error("Error loading featured Pokemon:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPokemon();
  }, [currentIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredPokemonIds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900">
      {/* Animated background particles */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: particle.width,
                height: particle.height,
                left: particle.left,
                top: particle.top,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-lg"
            >
              Pokémon Explorer
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl md:text-2xl text-white/90 mb-8"
            >
              Discover, explore, and master the world of Pokémon
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-wrap gap-4 justify-center md:justify-start"
            >
              <Link
                href="#pokemon"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
              >
                Start Exploring
              </Link>
              <Link
                href="/team-builder"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white rounded-lg font-semibold text-lg hover:bg-white/30 transition-all"
              >
                Build Team
              </Link>
            </motion.div>
          </motion.div>

          {/* Featured Pokemon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative h-80 md:h-96 flex items-center justify-center"
          >
            <AnimatePresence mode="wait">
              {featuredPokemon && !isLoading && (
                <motion.div
                  key={featuredPokemon.id}
                  initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <img
                    src={
                      featuredPokemon.sprites.other["official-artwork"]
                        .front_default || featuredPokemon.sprites.front_default || ""
                    }
                    alt={featuredPokemon.name}
                    className="h-72 md:h-96 w-auto drop-shadow-2xl"
                  />
                  <motion.div
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-2xl font-bold capitalize drop-shadow-lg">
                      {featuredPokemon.name}
                    </p>
                    <p className="text-sm opacity-80">
                      #{String(featuredPokemon.id).padStart(3, "0")}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {isLoading && (
              <div className="text-white text-xl">Loading...</div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

