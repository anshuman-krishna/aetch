'use client';

import { useEffect, useState } from 'react';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padded = base64String + '='.repeat((4 - (base64String.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function WebPushToggle() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && !!vapidPublic;
    setSupported(ok);
    if (!ok) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => setSubscribed(false));
  }, [vapidPublic]);

  if (!supported) return null;

  const subscribe = async () => {
    if (!vapidPublic) return;
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Notification permission denied');
      const key = urlBase64ToUint8Array(vapidPublic);
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // typings prefer ArrayBuffer; copy out of the typed array view
        applicationServerKey: key.buffer.slice(
          key.byteOffset,
          key.byteOffset + key.byteLength,
        ) as ArrayBuffer,
      });
      const json = sub.toJSON();
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: navigator.userAgent,
        }),
      });
      if (!res.ok) throw new Error('Subscribe failed');
      setSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const unsubscribe = async () => {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard padding="md" className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-foreground">Browser notifications</p>
        <p className="text-xs text-muted">Get pinged when an artist replies or a booking moves.</p>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
      <GlassButton
        variant={subscribed ? 'ghost' : 'primary'}
        size="sm"
        onClick={subscribed ? unsubscribe : subscribe}
        loading={busy}
      >
        {subscribed ? 'Disable' : 'Enable'}
      </GlassButton>
    </GlassCard>
  );
}
