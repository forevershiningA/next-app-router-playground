import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '#/lib/auth/session';

// Only protect raw API endpoints — /my-account pages handle their own auth UI
const PROTECTED_API = ['/api/account', '/api/orders'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_API.some((r) => pathname.startsWith(r));
  if (!isProtected) return NextResponse.next();

  const session = await verifySessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/account/:path*', '/api/orders/:path*'],
};
