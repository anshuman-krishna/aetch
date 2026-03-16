import Link from 'next/link';
import { GlassCard } from '@/components/ui/glass-card';
import { Palette, Sparkles, Calendar, Eye, MapPin, MessageCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* background */}
      <div className="gradient-mesh fixed inset-0 -z-10" />

      {/* nav */}
      <header className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-0">
        <nav className="mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3 glass-strong">
          <span className="text-xl font-bold tracking-tight text-foreground">
            AETCH
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-primary/90 px-4 py-2 text-sm font-medium text-white border border-primary-light/30 transition-colors hover:bg-primary"
            >
              Create Account
            </Link>
          </div>
        </nav>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-6xl px-6 pt-36 pb-20 text-center">
        <h1 className="text-display bg-gradient-to-r from-pastel-lavender via-primary-light to-pastel-sky bg-clip-text text-transparent">
          The Tattoo Creative Platform
        </h1>
        <p className="mt-6 mx-auto max-w-2xl text-lg text-muted">
          Discover inspiration, connect with artists, book sessions, generate
          AI tattoo concepts, and preview ink on your skin — all in one place.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
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
        </div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-h1 text-center text-foreground mb-4">
          Everything Tattoo
        </h2>
        <p className="text-center text-muted max-w-xl mx-auto mb-16">
          From discovery to aftercare — the complete ecosystem for tattoo culture.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <GlassCard key={f.title} padding="lg" className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.description}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* marketplace preview */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="glass-strong rounded-3xl p-10 md:p-16 text-center">
          <h2 className="text-h1 text-foreground mb-4">
            A Living Marketplace
          </h2>
          <p className="text-muted max-w-2xl mx-auto mb-8">
            Browse curated galleries, find verified artists by style and location,
            book sessions directly, and share your ink with the community.
          </p>
          <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-5">
                <p className="text-h2 text-primary">{s.value}</p>
                <p className="text-sm text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ai preview */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-h1 text-foreground mb-4">
              AI Tattoo Generator
            </h2>
            <p className="text-muted mb-6">
              Describe your vision and watch AI create unique tattoo concepts
              in seconds. Choose styles, placements, and color palettes — then
              preview directly on your skin with AR.
            </p>
            <Link
              href="/register"
              className="inline-flex rounded-xl bg-primary/90 px-6 py-3 text-sm font-medium text-white border border-primary-light/30 transition-colors hover:bg-primary"
            >
              Try AI Generation
            </Link>
          </div>
          <GlassCard padding="lg" className="text-center">
            <div className="rounded-2xl glass-subtle p-8">
              <Sparkles className="h-16 w-16 text-primary/60 mx-auto mb-4" />
              <p className="text-sm text-muted italic">
                &quot;Japanese dragon sleeve with waves and cherry blossoms&quot;
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {['Concept 1', 'Concept 2', 'Concept 3'].map((c) => (
                  <span key={c} className="glass rounded-lg px-3 py-1.5 text-xs text-foreground/70">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* cta */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-h1 text-foreground mb-4">
          Ready to Create?
        </h2>
        <p className="text-muted max-w-xl mx-auto mb-10">
          Join the most advanced tattoo platform on the internet.
        </p>
        <Link
          href="/register"
          className="rounded-xl bg-primary/90 px-10 py-4 text-lg font-medium text-white border border-primary-light/30 transition-all hover:bg-primary hover:scale-105"
        >
          Create Account
        </Link>
      </section>

      {/* footer */}
      <footer className="border-t border-border/50 bg-surface/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg font-bold text-foreground">AETCH</span>
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-muted">&copy; {new Date().getFullYear()} AETCH</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Palette,
    title: 'Curated Gallery',
    description: 'Browse tattoo designs filtered by style, color, and placement.',
  },
  {
    icon: Sparkles,
    title: 'AI Generation',
    description: 'Describe your dream tattoo and AI creates multiple concepts.',
  },
  {
    icon: Calendar,
    title: 'Easy Booking',
    description: 'Book sessions directly with verified artists and shops.',
  },
  {
    icon: Eye,
    title: 'AR Preview',
    description: 'See how your tattoo looks on your skin before committing.',
  },
  {
    icon: MapPin,
    title: 'Shop Directory',
    description: 'Find the best tattoo shops near you with reviews and ratings.',
  },
  {
    icon: MessageCircle,
    title: 'Direct Messaging',
    description: 'Chat with artists, discuss ideas, and plan your session.',
  },
];

const stats = [
  { value: '15+', label: 'Tattoo Styles' },
  { value: '∞', label: 'AI Concepts' },
  { value: '24/7', label: 'Booking' },
];
