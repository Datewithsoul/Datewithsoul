import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  if (url.pathname.startsWith('/admin')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', url.pathname);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
