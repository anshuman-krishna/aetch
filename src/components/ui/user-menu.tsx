'use client';

import { signOut, useSession } from 'next-auth/react';
import { GlassAvatar } from './glass-avatar';
import { GlassDropdown } from './glass-dropdown';
import Link from 'next/link';

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-xl bg-primary/90 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md border border-primary-light/30 transition-colors hover:bg-primary"
        >
          Get Started
        </Link>
      </div>
    );
  }

  const profileHref = session.user.username
    ? `/profile/${session.user.username}`
    : '/onboarding/role';

  const isArtist = session.user.role === 'ARTIST' || session.user.role === 'ADMIN';

  const menuItems = [
    { id: 'profile', label: 'Profile' },
    ...(isArtist ? [{ id: 'dashboard', label: 'Dashboard' }] : []),
    { id: 'saved', label: 'Saved' },
    { id: 'settings', label: 'Settings' },
    { id: 'logout', label: 'Log Out', danger: true },
  ];

  return (
    <GlassDropdown
      align="right"
      trigger={
        <GlassAvatar
          src={session.user.image}
          alt={session.user.name ?? ''}
          size="sm"
          className="cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all"
        />
      }
      items={menuItems}
      onSelect={(id) => {
        if (id === 'logout') {
          signOut({ callbackUrl: '/' });
        } else if (id === 'profile') {
          window.location.href = profileHref;
        } else if (id === 'dashboard') {
          window.location.href = '/dashboard';
        } else if (id === 'saved') {
          window.location.href = '/saved';
        } else if (id === 'settings') {
          window.location.href = '/settings';
        }
      }}
    />
  );
}
