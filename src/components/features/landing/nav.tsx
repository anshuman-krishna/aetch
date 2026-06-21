'use client';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import Link from 'next/link';

// landing top nav — theme toggle is an optional f4 dependency (one import)
export function LandingNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-0">
      <nav className="mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3 glass-strong">
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
          AETCH
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
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
  );
}
