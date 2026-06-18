import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: null as { accountId: string; email: string; role: string } | null,
  project: null as { id: string; accountId: string } | null,
  share: null as {
    id: string;
    shareToken: string;
    accessCodeHash: string | null;
    failedAccessAttempts: number;
    lockedUntil: Date | null;
    expiresAt: Date | null;
  } | null,
  insertedShare: null as Record<string, unknown> | null,
  updatePayloads: [] as Array<Record<string, unknown>>,
}));

vi.mock('#/lib/auth/session', () => ({
  getServerSession: vi.fn(async () => mocks.session),
}));

vi.mock('#/lib/db/index', () => ({
  db: {
    query: {
      projects: {
        findFirst: vi.fn(async () => mocks.project),
      },
      sharedDesigns: {
        findFirst: vi.fn(async () => mocks.share),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(async (payload: Record<string, unknown>) => {
        mocks.insertedShare = payload;
      }),
    })),
    update: vi.fn(() => ({
      set: vi.fn((payload: Record<string, unknown>) => {
        mocks.updatePayloads.push(payload);
        return {
          where: vi.fn(async () => undefined),
        };
      }),
    })),
  },
}));

import { POST as createShare } from '#/app/api/share/create/route';
import { POST as verifyShare } from '#/app/api/share/[token]/verify/route';

function jsonRequest(url: string, data: unknown) {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  });
}

describe('protected share flow', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = 'test-secret-with-enough-entropy';
    mocks.session = null;
    mocks.project = null;
    mocks.share = null;
    mocks.insertedShare = null;
    mocks.updatePayloads = [];
  });

  it('requires authentication before creating a share link', async () => {
    const response = await createShare(
      jsonRequest('http://localhost/api/share/create', { projectId: 'project-1' }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'Unauthorized' });
  });

  it('hides projects owned by another account', async () => {
    mocks.session = { accountId: 'owner-1', email: 'owner@example.com', role: 'user' };
    mocks.project = { id: 'project-1', accountId: 'owner-2' };

    const response = await createShare(
      jsonRequest('http://localhost/api/share/create', { projectId: 'project-1' }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ error: 'Project not found' });
    expect(mocks.insertedShare).toBeNull();
  });

  it('creates a protected share link with a one-time access code for the owner', async () => {
    mocks.session = { accountId: 'owner-1', email: 'owner@example.com', role: 'user' };
    mocks.project = { id: 'project-1', accountId: 'owner-1' };

    const response = await createShare(
      jsonRequest('http://localhost/api/share/create', {
        projectId: 'project-1',
        expiresInDays: 120,
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      success: true,
      shareToken: expect.any(String),
      shareUrl: expect.stringMatching(/^http:\/\/localhost\/shared\//),
      accessCode: expect.stringMatching(/^\d{6}$/),
      expiresAt: expect.any(String),
    });

    expect(mocks.insertedShare).toMatchObject({
      projectId: 'project-1',
      shareToken: body.shareToken,
      accessCodeHash: expect.any(String),
      expiresAt: expect.any(Date),
    });
    expect(body.shareToken).toHaveLength(32);
    await expect(
      bcrypt.compare(body.accessCode, mocks.insertedShare?.accessCodeHash as string),
    ).resolves.toBe(true);

    const expiresAt = mocks.insertedShare?.expiresAt as Date;
    expect(expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + 90 * 24 * 60 * 60 * 1000 + 1000);
  });

  it('rejects malformed access codes', async () => {
    const response = await verifyShare(
      jsonRequest('http://localhost/api/share/token-1/verify', { code: '1234' }),
      { params: Promise.resolve({ token: 'token-1' }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Enter the 6-digit access code',
    });
  });

  it('increments failed attempts and locks after five wrong codes', async () => {
    mocks.share = {
      id: 'share-1',
      shareToken: 'token-1',
      accessCodeHash: await bcrypt.hash('123456', 4),
      failedAccessAttempts: 4,
      lockedUntil: null,
      expiresAt: new Date(Date.now() + 60_000),
    };

    const response = await verifyShare(
      jsonRequest('http://localhost/api/share/token-1/verify', { code: '000000' }),
      { params: Promise.resolve({ token: 'token-1' }) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'Invalid access code' });
    expect(mocks.updatePayloads).toHaveLength(1);
    expect(mocks.updatePayloads[0]).toMatchObject({
      failedAccessAttempts: 5,
      lockedUntil: expect.any(Date),
    });
  });

  it('sets the share access cookie after a correct code', async () => {
    mocks.share = {
      id: 'share-1',
      shareToken: 'token-1',
      accessCodeHash: await bcrypt.hash('123456', 4),
      failedAccessAttempts: 2,
      lockedUntil: null,
      expiresAt: new Date(Date.now() + 60_000),
    };

    const response = await verifyShare(
      jsonRequest('http://localhost/api/share/token-1/verify', { code: '123456' }),
      { params: Promise.resolve({ token: 'token-1' }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ success: true });
    expect(mocks.updatePayloads).toContainEqual({
      failedAccessAttempts: 0,
      lockedUntil: null,
    });
    expect(response.headers.get('set-cookie')).toContain('share_access_token-1=');
    expect(response.headers.get('set-cookie')).toContain('HttpOnly');
    expect(response.headers.get('set-cookie')).toContain('Path=/shared/token-1');
  });
});
