import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public paths
  const publicPaths = ['/login', '/api/auth', '/api/seed', '/api/init-db', '/_next', '/favicon.ico'];
  const isPublic = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

  if (isPublic) {
    // If logged in and trying to access login, redirect to dashboard
    if (pathname === '/login' && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected paths - redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
