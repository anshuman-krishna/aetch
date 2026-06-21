import Link from 'next/link';

// links point only at routes that exist, avoiding the previous 404 targets
const columns = [
  {
    title: 'Discover',
    links: [
      { label: 'Gallery', href: '/app/gallery' },
      { label: 'Trending', href: '/app/trending' },
      { label: 'Shops', href: '/app/shops' },
      { label: 'Events', href: '/app/events' },
    ],
  },
  {
    title: 'Create',
    links: [
      { label: 'AI Generator', href: '/register' },
      { label: 'AR Preview', href: '/register' },
      { label: 'Learn', href: '/app/learn' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Create Account', href: '/register' },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 bg-surface/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className="text-lg font-bold text-foreground">AETCH</span>
            <p className="mt-2 max-w-xs text-sm text-muted">
              The complete creative ecosystem for tattoo culture.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-sm font-semibold text-foreground">{col.title}</p>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-muted transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-border/50 pt-6 text-xs text-muted sm:flex-row">
          <span>&copy; {new Date().getFullYear()} AETCH</span>
          <span>Built for tattoo culture.</span>
        </div>
      </div>
    </footer>
  );
}
