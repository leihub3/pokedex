"use client";

import { motion } from "framer-motion";

interface LoaderSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoaderSpinner({ size = "md", className = "" }: LoaderSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full dark:border-gray-700 dark:border-t-blue-400`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

