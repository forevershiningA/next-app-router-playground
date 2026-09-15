import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  sendEmail: vi.fn(),
  account: vi.fn(),
  values: vi.fn(),
}));

vi.mock('#/lib/auth/session', () => ({ getServerSession: mocks.session }));
vi.mock('#/lib/email', () => ({ sendEmail: mocks.sendEmail }));
vi.mock('#/lib/db/index', () => ({
  db: {
    query: { accounts: { findFirst: mocks.account } },
    insert: () => ({ values: mocks.values }),
  },
}));

import { POST as email } from '#/app/api/email/route';
import { POST as forgotPassword } from '#/app/api/auth/forgot-password/route';

function request(body: unknown) {
  return new NextRequest('http://localhost/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('password reset security', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.session.mockResolvedValue(null);
    mocks.sendEmail.mockResolvedValue({ success: true });
    mocks.account.mockResolvedValue({
      id: 'account-1',
      email: 'owner@example.com',
    });
    mocks.values.mockResolvedValue(undefined);
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined);
    vi.stubEnv('VERCEL_URL', undefined);
  });

  afterEach(() => vi.unstubAllEnvs());

  it.each([null, { accountId: 'account-1' }])(
    'rejects caller-supplied reset messages with session %j',
    async (session) => {
      mocks.session.mockResolvedValue(session);
      const response = await email(
        request({
          type: 'password-reset',
          recipientEmail: 'target@example.com',
          countryCode: 'au',
          resetUrl: 'https://untrusted.example/reset',
        }),
      );
      expect(response.status).toBe(403);
      expect(mocks.sendEmail).not.toHaveBeenCalled();
    },
  );

  it('requires authentication for other message types', async () => {
    const response = await email(
      request({
        type: 'enquiry',
        recipientEmail: 'target@example.com',
        countryCode: 'au',
      }),
    );
    expect(response.status).toBe(401);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it.each([
    ['https://shop.example', undefined, 'https://shop.example'],
    ['https://shop.example/', 'preview.example', 'https://shop.example'],
    [undefined, 'preview.example', 'https://preview.example'],
    [undefined, undefined, 'http://localhost:3000'],
  ])(
    'builds a server-generated reset URL for %s / %s',
    async (site, deployment, expected) => {
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', site);
      vi.stubEnv('VERCEL_URL', deployment);
      const before = Date.now();
      const response = await forgotPassword(
        request({
          email: ' OWNER@example.com ',
          resetUrl: 'https://untrusted.example/reset',
        }),
      );
      expect(response.status).toBe(200);
      const sent = mocks.sendEmail.mock.calls[0][0];
      expect(sent.recipientEmail).toBe('owner@example.com');
      expect(sent.resetUrl).toMatch(
        new RegExp(`^${expected}/reset-password/[a-f0-9]{64}$`),
      );
      const saved = mocks.values.mock.calls[0][0];
      expect(saved.tokenHash).not.toBe(sent.resetUrl.split('/').pop());
      expect(saved.expiresAt.getTime()).toBeGreaterThanOrEqual(
        before + 24 * 60 * 60 * 1000,
      );
      expect(saved.expiresAt.getTime()).toBeLessThanOrEqual(
        Date.now() + 24 * 60 * 60 * 1000,
      );
    },
  );

  it('does not send mail or create a token for an unknown account', async () => {
    mocks.account.mockResolvedValue(undefined);
    const response = await forgotPassword(
      request({ email: 'unknown@example.com' }),
    );
    expect(response.status).toBe(200);
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(mocks.values).not.toHaveBeenCalled();
  });
});
