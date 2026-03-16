'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/utils/cn';
import { NotificationDropdown } from '@/components/features/notifications/notification-dropdown';

export function NotificationNavButton() {
  const { data: session } = useSession();
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    if (!session?.user) return;

    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/messages/unread');
        if (res.ok) {
          const data = await res.json();
          setMsgCount(data.count ?? 0);
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
      <Link
        href="/app/messages"
        className={cn(
          'relative rounded-xl p-2 text-foreground/70 transition-colors',
          'hover:bg-white/10 hover:text-foreground',
        )}
        aria-label="Messages"
      >
        <MessageCircle className="h-5 w-5" />
        {msgCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {msgCount > 99 ? '99+' : msgCount}
          </span>
        )}
      </Link>
      <NotificationDropdown />
    </div>
  );
}
