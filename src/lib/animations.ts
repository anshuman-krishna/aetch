import type { Variants, Transition } from 'framer-motion';

// transitions

export const springSmooth: Transition = {
  type: 'spring',
  damping: 25,
  stiffness: 300,
};

export const springBouncy: Transition = {
  type: 'spring',
  damping: 15,
  stiffness: 400,
};

export const easeFade: Transition = {
  duration: 0.2,
  ease: 'easeInOut',
};

// page transitions

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

// stagger children

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// scale on hover

export const hoverScale = {
  whileHover: { scale: 1.02, transition: springSmooth },
  whileTap: { scale: 0.98, transition: springSmooth },
};

// card hover elevation

export const hoverElevation = {
  whileHover: {
    y: -4,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
    transition: springSmooth,
  },
};

// button press

export const buttonPress = {
  whileTap: { scale: 0.96, transition: { duration: 0.1 } },
};

// fade in

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: easeFade },
  exit: { opacity: 0, transition: easeFade },
};

// slide in

export const slideInFromBottom: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: springSmooth },
  exit: { opacity: 0, y: 12, transition: easeFade },
};

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: springSmooth },
  exit: { opacity: 0, x: 12, transition: easeFade },
};

// modal

export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springSmooth },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: easeFade },
};
