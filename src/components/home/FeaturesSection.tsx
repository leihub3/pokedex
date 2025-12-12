"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  {
    title: "Team Builder",
    description: "Create your perfect Pokémon team",
    icon: "👥",
    href: "/team-builder",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Battle Simulator",
    description: "See who would win in battle",
    icon: "⚔️",
    href: "/battle-simulator",
    color: "from-red-500 to-orange-500",
  },
  {
    title: "PokéQuiz",
    description: "Test your Pokémon knowledge",
    icon: "🧠",
    href: "/quiz",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Favorites",
    description: "Save your favorite Pokémon",
    icon: "❤️",
    href: "/favorites",
    color: "from-pink-500 to-red-500",
  },
];

export function FeaturesSection() {
  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100"
        >
          Explore All Features
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Link href={feature.href}>
                <div className={`bg-gradient-to-br ${feature.color} rounded-xl p-6 h-full text-white shadow-lg hover:shadow-2xl transition-all cursor-pointer`}>
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="opacity-90">{feature.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}


