import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromRequest } from '#/lib/auth/session';
import { resolveUnitSystemFromCountry } from '#/lib/unit-system';

// Only protect raw API endpoints — /my-account pages handle their own auth UI
const PROTECTED_API = ['/api/account', '/api/orders'];

// Block direct access to raw (non-anonymized) price-quote HTML files.
// Anonymized copies are served from html-anon/ — see scripts/anonymize-price-quotes.ts
const BLOCKED_PATHS = /^\/ml\/[^/]+\/saved-designs\/html\/[^/]+\.html$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_API.some((r) => pathname.startsWith(r));
  const isBlocked = BLOCKED_PATHS.test(pathname);
  const countryHeader =
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('x-country-code');
  const resolvedUnitSystem = resolveUnitSystemFromCountry(countryHeader);
  const existingUnitSystem = request.cookies.get('unit_system')?.value;

  if (!isProtected) {
    if (isBlocked) {
      return new NextResponse(null, { status: 404 });
    }
    const response = NextResponse.next();
    if (existingUnitSystem !== resolvedUnitSystem) {
      response.cookies.set('unit_system', resolvedUnitSystem, {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }
    return response;
  }

  const session = await verifySessionFromRequest(request);
  if (!session) {
    const unauthorised = NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    if (existingUnitSystem !== resolvedUnitSystem) {
      unauthorised.cookies.set('unit_system', resolvedUnitSystem, {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }
    return unauthorised;
  }

  const response = NextResponse.next();
  if (existingUnitSystem !== resolvedUnitSystem) {
    response.cookies.set('unit_system', resolvedUnitSystem, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff2?|ttf)$).*)',
  ],
};
