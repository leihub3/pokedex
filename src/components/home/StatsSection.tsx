"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const stats = [
  { label: "Total Pokémon", value: 1000, icon: "🎮", color: "from-blue-500 to-cyan-500" },
  { label: "Types", value: 18, icon: "⚡", color: "from-purple-500 to-pink-500" },
  { label: "Generations", value: 9, icon: "🌟", color: "from-yellow-500 to-orange-500" },
  { label: "Moves", value: 900, icon: "🔥", color: "from-red-500 to-orange-500" },
];

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}{end >= 100 ? "+" : ""}</span>;
}

export function StatsSection() {
  return (
    <div className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-center text-white shadow-lg hover:shadow-2xl transition-shadow cursor-default`}
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold mb-1">
                <CountUp end={stat.value} />
              </div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}




