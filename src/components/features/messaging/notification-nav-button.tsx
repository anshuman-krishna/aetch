'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/utils/cn';

export function NotificationNavButton() {
  const { data: session } = useSession();
  const [msgCount, setMsgCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!session?.user) return;

    const fetchCounts = async () => {
      try {
        const [msgRes, notifRes] = await Promise.all([
          fetch('/api/messages/unread'),
          fetch('/api/notifications?count=true'),
        ]);
        if (msgRes.ok) {
          const data = await msgRes.json();
          setMsgCount(data.count ?? 0);
        }
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifCount(data.count ?? 0);
        }
      } catch {
        // silent fail
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [session?.user]);

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-0.5">
      <NavIcon href="/messages" count={msgCount} label="Messages">
        <MessageCircle className="h-5 w-5" />
      </NavIcon>
      <NavIcon href="/notifications" count={notifCount} label="Notifications">
        <Bell className="h-5 w-5" />
      </NavIcon>
    </div>
  );
}

function NavIcon({
  href,
  count,
  label,
  children,
}: {
  href: string;
  count: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'relative rounded-xl p-2 text-foreground/70 transition-colors',
        'hover:bg-white/10 hover:text-foreground',
      )}
      aria-label={label}
    >
      {children}
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
