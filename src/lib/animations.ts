import { type Variants } from "framer-motion";

// Springy entrance for cards/panels
export const springIn: Variants = {
  hidden: { scale: 0.8, opacity: 0, y: 30 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
      duration: 0.6,
    },
  },
};

// Pop in from zero
export const popIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
};

// Slide in from bottom
export const slideUp: Variants = {
  hidden: { y: 60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// Stagger children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// Heartbeat pulse for the YES button
export const heartbeat = {
  animate: {
    scale: [1, 1.08, 1, 1.05, 1],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

// Shake animation for wrong actions
export const shake: Variants = {
  shake: {
    x: [-10, 10, -8, 8, -5, 5, 0],
    transition: { duration: 0.5 },
  },
};

// Button press mechanic
export const comicPress = {
  whileTap: {
    scale: 0.97,
    x: 4,
    y: 4,
    boxShadow: "0 0 0 #000",
    transition: { duration: 0.1 },
  },
  whileHover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
};
