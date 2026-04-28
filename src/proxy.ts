import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const protectedPaths = [
  '/onboarding',
  '/app/profile/edit',
  '/app/dashboard',
  '/app/settings',
  '/app/saved',
  '/app/book',
  '/app/shop-dashboard',
  '/app/feed',
  '/app/create-post',
  '/app/ai',
  '/app/ar-preview',
  '/app/messages',
  '/app/admin',
];
const authPaths = ['/login', '/register'];

// security response headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

const isProd = process.env.NODE_ENV === 'production';

// per-request csp with nonce for inline next.js bootstrap scripts.
// strict-dynamic in prod lets nonce'd scripts pull in transitively-loaded
// libs (maplibre, mapbox), which works without enumerating every CDN host.
function buildCsp(nonce: string): string {
  const scriptSrc = isProd
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}' https://unpkg.com`;
  const connectSrc = isProd
    ? "connect-src 'self' https: wss:"
    : "connect-src 'self' https: wss: ws:";
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://unpkg.com",
    "img-src 'self' data: blob: https:",
    "worker-src 'self' blob:",
    "font-src 'self' data: https://unpkg.com",
    connectSrc,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isProd ? ['upgrade-insecure-requests'] : []),
  ].join('; ');
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // redirect authed users
  if (isLoggedIn && authPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // protect authenticated routes
  if (!isLoggedIn && protectedPaths.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // enforce onboarding on app routes
  if (
    isLoggedIn &&
    !req.auth?.user?.onboardingComplete &&
    pathname.startsWith('/app') &&
    !pathname.startsWith('/api')
  ) {
    return NextResponse.redirect(new URL('/onboarding/role', req.url));
  }

  // generate per-request nonce for csp; expose to layout via request header
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-csp-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  response.headers.set('Content-Security-Policy', buildCsp(nonce));
  return response;
});

export const config = {
  matcher: ['/((?!_next|api/auth|favicon.ico|.*\\..*).*)'],
};
