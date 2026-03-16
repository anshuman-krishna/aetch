'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        fetch('/api/notifications?count=true'),
        open ? fetch('/api/notifications') : Promise.resolve(null),
      ]);
      const countData = await countRes.json();
      setUnread(countData.count ?? 0);

      if (listRes) {
        const listData = await listRes.json();
        setNotifications(listData.notifications ?? []);
      }
    } catch { /* ignore */ }
  }, [open]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // fetch full list when opened
  useEffect(() => {
    if (open) {
      fetch('/api/notifications')
        .then((r) => r.json())
        .then((d) => setNotifications(d.notifications ?? []))
        .catch(() => {});
    }
  }, [open]);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' });
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await fetch('/api/notifications/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl p-2 text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl glass-strong overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <h3 className="text-sm font-semibold text-foreground">
                Notifications
              </h3>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  No notifications yet
                </p>
              ) : (
                notifications.map((n) => {
                  const content = (
                    <div
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5',
                        !n.read && 'bg-primary/5',
                      )}
                      onClick={() => {
                        if (!n.read) markRead(n.id);
                        setOpen(false);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-muted truncate">
                          {n.message}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted shrink-0">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                  );

                  return n.link ? (
                    <Link key={n.id} href={n.link}>
                      {content}
                    </Link>
                  ) : (
                    <div key={n.id}>{content}</div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
