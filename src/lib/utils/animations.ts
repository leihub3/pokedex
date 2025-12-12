import { Variants } from "framer-motion";

/**
 * Stagger animation variants for grid layouts
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

/**
 * Card hover animations
 */
export const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.05,
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.95,
  },
};

/**
 * Card flip animation
 */
export const cardFlip: Variants = {
  front: {
    rotateY: 0,
    transition: {
      duration: 0.6,
    },
  },
  back: {
    rotateY: 180,
    transition: {
      duration: 0.6,
    },
  },
};

/**
 * Fade in animation
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Fade out animation
 */
export const fadeOut: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Slide in from bottom
 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/**
 * Slide in from right
 */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

/**
 * Glow effect on hover
 */
export const glow: Variants = {
  rest: {
    boxShadow: "0 0 0px rgba(0, 0, 0, 0)",
  },
  hover: {
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Page transition
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

