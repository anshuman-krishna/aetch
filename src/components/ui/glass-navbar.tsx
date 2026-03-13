'use client';

import Link from 'next/link';
import { cn } from '@/utils/cn';
import { MobileNavbar } from '@/components/layouts/mobile-navbar';
import { UserMenu } from './user-menu';
import { NotificationNavButton } from '@/components/features/messaging/notification-nav-button';

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/artists', label: 'Artists' },
  { href: '/shops', label: 'Shops' },
  { href: '/feed', label: 'Feed' },
];

export function GlassNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-0">
      <nav
        className={cn(
          'mx-auto mt-3 flex max-w-6xl items-center justify-between',
          'rounded-2xl px-4 py-2.5 sm:px-6 sm:py-3 glass-strong',
        )}
        aria-label="Main navigation"
      >
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
          AETCH
        </Link>

        <div className="hidden items-center gap-1 md:flex" role="menubar">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              className="rounded-xl px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-1">
          <NotificationNavButton />
          <UserMenu />
        </div>

        <MobileNavbar />
      </nav>
    </header>
  );
}
