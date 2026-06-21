'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

// thin top reading-progress bar tied to page scroll
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 });

  return (
    <motion.div
      style={{ scaleX }}
      aria-hidden
      className="fixed left-0 top-0 z-[200] h-0.5 w-full origin-left bg-gradient-to-r from-pastel-lavender via-primary to-pastel-sky"
    />
  );
}
