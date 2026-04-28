// AETCH service worker for web push notifications.
// keep this small + dependency-free so first-load cost is minimal.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = { title: 'AETCH', body: 'New activity', url: '/app/notifications' };
  try {
    if (event.data) {
      const text = event.data.text();
      if (text) payload = { ...payload, ...JSON.parse(text) };
    }
  } catch {
    // empty payload (tickle) — fall through to default copy
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: { url: payload.url },
      badge: '/icon.png',
      icon: '/icon.png',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/app/notifications';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});
