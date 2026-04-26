'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/utils/cn';

const roles = [
  {
    id: 'USER' as const,
    title: 'Tattoo Enthusiast',
    description: 'Discover tattoos, follow artists, book sessions',
    icon: '\u{2728}',
    path: '/onboarding/user',
  },
  {
    id: 'ARTIST' as const,
    title: 'Tattoo Artist',
    description: 'Build your portfolio, manage bookings, grow your brand',
    icon: '\u{1F3A8}',
    path: '/onboarding/artist',
  },
  {
    id: 'SHOP_OWNER' as const,
    title: 'Shop Owner',
    description: 'Manage your shop, team of artists, and bookings',
    icon: '\u{1F3EA}',
    path: '/onboarding/shop',
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    const role = roles.find((r) => r.id === selected);
    if (role) router.push(role.path);
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-h2 text-foreground">Choose your role</h1>
        <p className="mt-2 text-muted">How will you use AETCH?</p>
      </div>

      <div className="space-y-3">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setSelected(role.id)}
            className={cn(
              'w-full text-left rounded-2xl p-5 transition-all duration-200',
              selected === role.id
                ? 'glass-strong ring-2 ring-primary/50 scale-[1.01]'
                : 'glass hover:bg-white/15',
            )}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl" aria-hidden="true">
                {role.icon}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{role.title}</h3>
                <p className="mt-0.5 text-sm text-muted">{role.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected}
        className={cn(
          'mt-8 w-full rounded-xl py-3 text-base font-medium transition-all',
          selected
            ? 'bg-primary/90 text-white hover:bg-primary cursor-pointer'
            : 'glass text-muted cursor-not-allowed opacity-60',
        )}
      >
        Continue
      </button>
    </div>
  );
}
