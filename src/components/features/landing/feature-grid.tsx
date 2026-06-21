'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { motion, type Variants } from 'framer-motion';
import { Calendar, Eye, MapPin, MessageCircle, Palette, Sparkles } from 'lucide-react';

const features = [
  { icon: Palette, title: 'Curated Gallery', description: 'Browse tattoo designs filtered by style, color, and placement.' },
  { icon: Sparkles, title: 'AI Generation', description: 'Describe your dream tattoo and AI creates multiple concepts.' },
  { icon: Calendar, title: 'Easy Booking', description: 'Book sessions directly with verified artists and shops.' },
  { icon: Eye, title: 'AR Preview', description: 'See how your tattoo looks on your skin before committing.' },
  { icon: MapPin, title: 'Shop Directory', description: 'Find the best tattoo shops near you with reviews and ratings.' },
  { icon: MessageCircle, title: 'Direct Messaging', description: 'Chat with artists, discuss ideas, and plan your session.' },
];

const item = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} satisfies Variants;

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-h1 text-center text-foreground mb-4">Everything Tattoo</h2>
      <p className="text-center text-muted max-w-xl mx-auto mb-16">
        From discovery to aftercare — the complete ecosystem for tattoo culture.
      </p>
      <motion.div
        variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-80px' }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((f) => (
          <motion.div key={f.title} variants={item}>
            <GlassCard
              padding="lg"
              className="h-full text-center transition-transform hover:-translate-y-1"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.description}</p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
