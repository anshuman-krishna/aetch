'use client';

import { cn } from '@/utils/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  links: SidebarLink[];
  className?: string;
}

export function Sidebar({ links, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex w-64 shrink-0 flex-col gap-1 rounded-2xl glass p-3',
        className,
      )}
    >
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/15 text-primary'
                : 'text-foreground/70 hover:bg-white/10 hover:text-foreground',
            )}
          >
            {link.icon && <span className="shrink-0">{link.icon}</span>}
            {link.label}
          </Link>
        );
      })}
    </aside>
  );
}
