import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/signup', '/', '/projects'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = publicPaths.some(p =>
    pathname === p || pathname.startsWith(p + '/')
  );
  if (isPublic) return NextResponse.next();

  if (pathname.startsWith('/dashboard') && !req.cookies.get('token')?.value) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
