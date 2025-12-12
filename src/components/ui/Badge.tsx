"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { getTypeColor } from "@/lib/utils/typeColors";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "type";
  typeName?: string;
  className?: string;
  hover?: boolean;
}

export function Badge({
  children,
  variant = "default",
  typeName,
  className,
  hover = false,
}: BadgeProps) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all";
  
  if (variant === "type" && typeName) {
    const colors = getTypeColor(typeName);
    const badge = (
      <span
        className={cn(
          baseClasses,
          colors.bg,
          colors.text,
          colors.border,
          hover && "cursor-pointer hover:scale-110 hover:shadow-md",
          className
        )}
      >
        {children}
      </span>
    );

    if (hover) {
      return (
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          {badge}
        </motion.div>
      );
    }

    return badge;
  }

  return (
    <span
      className={cn(
        baseClasses,
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        className
      )}
    >
      {children}
    </span>
  );
}

