import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const protectedPaths = ['/onboarding', '/profile/edit', '/dashboard', '/settings', '/saved', '/book', '/shop-dashboard', '/feed', '/create-post', '/ai', '/ar-preview', '/messages'];
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

  // enforce onboarding completion
  if (
    isLoggedIn &&
    !req.auth?.user?.onboardingComplete &&
    !pathname.startsWith('/onboarding') &&
    !pathname.startsWith('/api') &&
    !authPaths.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.redirect(new URL('/onboarding/role', req.url));
  }

  // apply security headers
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
});

export const config = {
  matcher: ['/((?!_next|api/auth|favicon.ico|.*\\..*).*)'],
};
