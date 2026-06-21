'use client';

import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="gradient-mesh fixed inset-0 -z-10" />
      <div className="glass-strong w-full max-w-md rounded-3xl p-10 text-center">
        <motion.div
          animate={{ rotate: [0, 12, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
        >
          <Compass className="h-8 w-8 text-primary" />
        </motion.div>
        <h1 className="text-display text-foreground">404</h1>
        <p className="mt-2 text-muted">This page wandered off the map.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-primary/90 px-6 py-3 text-sm font-medium text-white border border-primary-light/30 transition-colors hover:bg-primary"
          >
            Back home
          </Link>
          <Link
            href="/app/gallery"
            className="glass rounded-xl px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/20"
          >
            Explore gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
