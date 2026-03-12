import { GlassCard } from '@/components/ui/glass-card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      {/* Hero */}
      <section className="flex flex-col items-center text-center">
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-foreground md:text-7xl">
          The Tattoo
          <br />
          <span className="bg-gradient-to-r from-pastel-lavender via-primary-light to-pastel-sky bg-clip-text text-transparent">
            Creative Platform
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Discover inspiration, connect with artists, book sessions, and explore AI-powered tattoo
          design — all in one place.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center rounded-xl bg-primary/90 px-7 py-3 text-base font-medium text-white backdrop-blur-md border border-primary-light/30 transition-colors hover:bg-primary"
          >
            Explore Gallery
          </Link>
          <Link
            href="/artists"
            className="glass inline-flex items-center justify-center rounded-xl px-7 py-3 text-base font-medium text-foreground transition-all hover:bg-white/20"
          >
            Find Artists
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mt-32 grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <GlassCard key={feature.title} padding="lg" className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted">{feature.description}</p>
          </GlassCard>
        ))}
      </section>
    </div>
  );
}

const features = [
  {
    icon: '\u{1F3A8}',
    title: 'Curated Gallery',
    description: 'Browse thousands of tattoo designs filtered by style, color, and placement.',
  },
  {
    icon: '\u{2728}',
    title: 'AI Generation',
    description: 'Describe your dream tattoo and let AI bring it to life with multiple concepts.',
  },
  {
    icon: '\u{1F4C5}',
    title: 'Easy Booking',
    description: 'Book sessions directly with verified artists and shops near you.',
  },
];
