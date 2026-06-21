'use client';

import { motion, type Variants } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

const container = {
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
} satisfies Variants;

const item = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
} satisfies Variants;

export function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-40 pb-24 text-center">
      {/* drifting glow accents */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/4 h-72 w-72 rounded-full bg-pastel-lavender/40 blur-3xl"
        animate={{ y: [0, 24, 0], x: [0, 12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-20 right-1/4 h-72 w-72 rounded-full bg-pastel-sky/40 blur-3xl"
        animate={{ y: [0, -28, 0], x: [0, -16, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div variants={container} initial="initial" animate="animate" className="relative">
        <motion.div
          variants={item}
          className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-foreground/80"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          AI generation · AR preview · live bookings
        </motion.div>

        <motion.h1
          variants={item}
          className="text-display bg-gradient-to-r from-pastel-lavender via-primary-light to-pastel-sky bg-clip-text text-transparent"
        >
          The Tattoo Creative Platform
        </motion.h1>

        <motion.p variants={item} className="mt-6 mx-auto max-w-2xl text-lg text-muted">
          Discover inspiration, connect with artists, book sessions, generate AI tattoo concepts,
          and preview ink on your skin — all in one place.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-primary/90 px-8 py-3.5 text-base font-medium text-white border border-primary-light/30 transition-all hover:bg-primary hover:scale-105"
          >
            Start Designing
          </Link>
          <Link
            href="/app/gallery"
            className="glass rounded-xl px-8 py-3.5 text-base font-medium text-foreground transition-all hover:bg-white/20 hover:scale-105"
          >
            Explore Artists
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
