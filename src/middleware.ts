import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const protectedPaths = ['/onboarding', '/profile/edit', '/dashboard', '/settings', '/saved', '/book'];
const authPaths = ['/login', '/register'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Redirect logged-in users away from auth pages
  if (isLoggedIn && authPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Protect authenticated routes
  if (!isLoggedIn && protectedPaths.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to onboarding if not complete
  if (
    isLoggedIn &&
    !req.auth?.user?.onboardingComplete &&
    !pathname.startsWith('/onboarding') &&
    !pathname.startsWith('/api') &&
    !authPaths.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.redirect(new URL('/onboarding/role', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|api/auth|favicon.ico|.*\\..*).*)'],
};
