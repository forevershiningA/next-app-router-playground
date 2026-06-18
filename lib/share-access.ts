import { createHmac, randomInt, timingSafeEqual } from 'crypto';

import { NextResponse } from 'next/server';

const COOKIE_PREFIX = 'share_access_';
const ACCESS_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET env var is not set');
  return secret;
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function cookieName(token: string): string {
  return `${COOKIE_PREFIX}${token}`;
}

export function generateShareAccessCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function createShareAccessCookie(response: NextResponse, shareToken: string): void {
  const expiresAt = Math.floor(Date.now() / 1000) + ACCESS_MAX_AGE_SECONDS;
  const payload = `${shareToken}.${expiresAt}`;
  response.cookies.set(cookieName(shareToken), `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ACCESS_MAX_AGE_SECONDS,
    path: `/shared/${shareToken}`,
  });
}

export function hasValidShareAccessCookie(
  cookieStore: { get(name: string): { value: string } | undefined },
  shareToken: string,
): boolean {
  const raw = cookieStore.get(cookieName(shareToken))?.value;
  if (!raw) return false;

  const [token, expiresAtRaw, signature] = raw.split('.');
  if (!token || !expiresAtRaw || !signature || token !== shareToken) return false;

  const expiresAt = Number.parseInt(expiresAtRaw, 10);
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = sign(`${token}.${expiresAtRaw}`);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}
