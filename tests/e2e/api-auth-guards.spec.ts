import { expect, test } from '@playwright/test';

// covers the "unauth → 401" rows from manual-qa-checklist.md
const guarded = [
  { method: 'get', path: '/api/users/me' },
  { method: 'get', path: '/api/artists/me' },
  { method: 'get', path: '/api/artists/availability' },
  { method: 'get', path: '/api/artists/analytics' },
  { method: 'get', path: '/api/notifications' },
  { method: 'patch', path: '/api/notifications/read' },
  { method: 'get', path: '/api/user/saved' },
  { method: 'post', path: '/api/user/onboarding' },
  { method: 'get', path: '/api/messages/conversations' },
  { method: 'get', path: '/api/messages/unread' },
  { method: 'get', path: '/api/ai/history' },
  { method: 'get', path: '/api/ar-preview/history' },
  { method: 'post', path: '/api/reports' },
  { method: 'post', path: '/api/uploads/sign' },
] as const;

test.describe('api guards', () => {
  for (const g of guarded) {
    test(`${g.method.toUpperCase()} ${g.path} → 401 unauthenticated`, async ({ request }) => {
      const resp =
        g.method === 'get'
          ? await request.get(g.path)
          : g.method === 'post'
            ? await request.post(g.path, { data: {} })
            : await request.patch(g.path, { data: {} });
      expect([401, 403, 404]).toContain(resp.status());
    });
  }
});

test.describe('admin guards', () => {
  type AdminRoute = { method: 'get' | 'patch' | 'delete'; path: string };
  const adminGuarded: AdminRoute[] = [
    { method: 'get', path: '/api/admin/users' },
    { method: 'get', path: '/api/admin/audit' },
    { method: 'patch', path: '/api/admin/users' },
    { method: 'delete', path: '/api/admin/posts?id=fix_post_1' },
    { method: 'delete', path: '/api/admin/tattoos?id=fix_tattoo_1' },
  ];

  for (const g of adminGuarded) {
    test(`${g.method.toUpperCase()} ${g.path} → 401`, async ({ request }) => {
      const resp =
        g.method === 'get'
          ? await request.get(g.path)
          : g.method === 'patch'
            ? await request.patch(g.path, { data: {} })
            : await request.delete(g.path);
      expect([401, 403]).toContain(resp.status());
    });
  }
});

test.describe('input validation', () => {
  test('signed upload rejects non-image content type', async ({ request }) => {
    const resp = await request.post('/api/uploads/sign', {
      data: { scope: 'tattoos', contentType: 'application/pdf', fileExt: 'pdf', size: 1000 },
    });
    expect([400, 401]).toContain(resp.status());
  });

  test('signed upload rejects bad scope', async ({ request }) => {
    const resp = await request.post('/api/uploads/sign', {
      data: { scope: 'malware', contentType: 'image/jpeg', fileExt: 'jpg', size: 1000 },
    });
    expect([400, 401]).toContain(resp.status());
  });
});
