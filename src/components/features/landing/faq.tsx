'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Reveal } from './reveal';

const faqs = [
  {
    q: 'Do I need an account to explore?',
    a: 'You can browse the gallery and try the AR preview on this page without signing up. Booking, saving, and AI generation need a free account.',
  },
  {
    q: 'How does the AR preview work?',
    a: 'Upload a photo of where you want the tattoo, drop a design on top, then drag, scale, rotate, and adjust opacity. The full studio saves your previews to history.',
  },
  {
    q: 'Can artists and shops join?',
    a: 'Yes. Artists build portfolios, set availability, and take bookings. Shops group multiple artists under one studio profile with aggregated booking.',
  },
  {
    q: 'Is the AI generator unlimited?',
    a: 'Generation is rate limited and validated to keep quality high — not a free-for-all. You can save concepts and send them straight to AR preview.',
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium text-foreground">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <p className="px-5 pb-4 text-sm text-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="text-h1 text-center text-foreground mb-12">Questions</h2>
      <Reveal className="flex flex-col gap-3">
        {faqs.map((f) => (
          <Item key={f.q} {...f} />
        ))}
      </Reveal>
    </section>
  );
}
