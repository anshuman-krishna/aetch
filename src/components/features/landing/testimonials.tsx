'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// sample social proof — copy is illustrative
const testimonials = [
  { quote: 'Previewed three placements in AR before booking. Walked in already knowing exactly what I wanted.', name: 'Maya R.', role: 'Collector' },
  { quote: 'The AI concepts gave my client and me a shared starting point. Cut our consult time in half.', name: 'Devin K.', role: 'Artist' },
  { quote: 'Finally a place where our whole studio lives under one profile with real booking flow.', name: 'Inkhouse Studio', role: 'Shop' },
  { quote: 'Found a fine-line artist two blocks away I never knew existed. Booked the same week.', name: 'Sofia L.', role: 'Collector' },
];

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % testimonials.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  const active = testimonials[index];

  return (
    <section
      className="mx-auto max-w-3xl px-6 py-20 text-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Quote className="mx-auto mb-6 h-8 w-8 text-primary/50" />
      <div className="relative min-h-[9rem]">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xl text-foreground/90 leading-relaxed">{active.quote}</p>
            <footer className="mt-5 text-sm text-muted">
              <span className="font-medium text-foreground">{active.name}</span> · {active.role}
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>
      <div className="mt-8 flex justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Testimonial ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${
              i === index ? 'w-6 bg-primary' : 'w-2 bg-foreground/20 hover:bg-foreground/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
