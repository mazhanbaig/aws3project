import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/api/auth/login', '/api/auth/signup', '/api/health', '/login', '/signup'];

/**
 * Lightweight Edge-compatible auth check.
 * Only checks if a token cookie exists — actual verification happens
 * in API routes, avoiding jsonwebtoken (not Edge-compatible).
 */
function hasTokenCookie(req: NextRequest): boolean {
  return !!req.cookies.get('token')?.value;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    if (!hasTokenCookie(req)) {
      // Also check Authorization header for non-browser clients
      const auth = req.headers.get('authorization');
      if (!auth?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/dashboard') && !hasTokenCookie(req)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
