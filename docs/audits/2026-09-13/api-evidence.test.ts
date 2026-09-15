/** Audit reproductions, NOT acceptance tests: passing means the reported defect exists.
 * No real database, payment requests, storage writes or emails are used.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const state = vi.hoisted(() => ({
  session: { accountId: 'audit-owner', email: 'audit@example.invalid', role: 'client' } as Record<string, string> | null,
  project: {} as Record<string, any>,
  writes: [] as Array<{ table: string; payload: Record<string, any> }>,
  callbacks: [] as Array<() => Promise<void>>,
  emails: [] as Record<string, any>[],
  checkout: null as Record<string, any> | null,
}));

vi.mock('next/server', async (importOriginal) => ({
  ...await importOriginal<typeof import('next/server')>(),
  after: (callback: () => Promise<void>) => state.callbacks.push(callback),
}));
vi.mock('#/lib/auth/session', () => ({ getServerSession: async () => state.session }));
vi.mock('#/lib/email', () => ({ sendEmail: async (data: Record<string, any>) => {
  state.emails.push(data);
  return { success: true };
} }));
vi.mock('#/lib/email/helpers', () => ({ detailedQuoteItems: () => [] }));
vi.mock('#/lib/upload/proxy', () => ({ uploadToStorage: async () => '/audit/mock-upload.json' }));
vi.mock('#/lib/server/design-pricing', () => ({
  calculateAuthoritativeQuote: async () => ({
    totalCents: 110000,
    currency: 'AUD',
    breakdown: { subtotal: 1000, tax: 100, total: 1100 },
  }),
}));
vi.mock('stripe', () => ({ default: class {
  checkout = { sessions: { create: async (data: Record<string, any>) => {
    state.checkout = data;
    return { id: 'cs_audit_mock' };
  } } };
} }));
vi.mock('#/lib/db/index', async () => {
  const schema = await import('#/lib/db/schema');
  const tableName = (table: unknown) => Object.entries(schema).find(([, value]) => value === table)?.[0] ?? 'unknown';
  const record = (table: unknown, payload: Record<string, any>) => {
    const name = tableName(table);
    state.writes.push({ table: name, payload });
    if (name === 'projects') state.project = { ...state.project, ...payload };
    return name === 'projects' ? state.project : { id: 'audit-order', ...payload };
  };
  return {
    projects: schema.projects,
    db: {
      query: {
      projects: { findFirst: async () => state.project },
      orders: { findFirst: async () => {
        const latest = [...state.writes].reverse().find((row) => row.table === 'orders');
        return latest ? { id: 'audit-order', ...latest.payload } : undefined;
      } },
        accounts: { findFirst: async () => ({ id: 'audit-owner', email: 'audit@example.invalid' }) },
      },
      insert: (table: unknown) => ({ values: (payload: Record<string, any>) => {
        const row = record(table, payload);
        return { returning: async () => [row] };
      } }),
      update: (table: unknown) => ({ set: (payload: Record<string, any>) => ({
        where: () => {
          const row = record(table, payload);
          return { returning: async () => [row] };
        },
      }) }),
    },
  };
});

import { POST as saveProject } from '#/app/api/projects/route';
import { POST as createOrder } from '#/app/api/orders/route';
import { PATCH as updateOrder } from '#/app/api/orders/[id]/route';
import { POST as checkout } from '#/app/api/checkout/stripe/route';
import { POST as email } from '#/app/api/email/route';
import { POST as forgotPassword } from '#/app/api/auth/forgot-password/route';
import { saveProjectRecord } from '#/lib/projects-db';
import type { DesignerSnapshot } from '#/lib/project-schemas';

function request(path: string, body: unknown, method = 'POST') {
  return new NextRequest(`http://localhost${path}`, {
    method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}

beforeEach(() => {
  state.session = { accountId: 'audit-owner', email: 'audit@example.invalid', role: 'client' };
  state.project = {
    id: 'audit-project', accountId: 'audit-owner', title: 'Original', status: 'draft',
    totalPriceCents: 110000, currency: 'AUD', designState: {}, pricingBreakdown: { total: 1100 },
    createdAt: new Date(), updatedAt: new Date(),
  };
  state.writes = []; state.callbacks = []; state.emails = []; state.checkout = null;
});
afterEach(() => vi.unstubAllEnvs());

describe('2026-09-13 audit: confirmed unsafe behavior', () => {
  it('A01: client can only create a pending order', async () => {
    const response = await createOrder(request('/api/orders', {
      projectId: 'audit-project', paymentMethod: 'stripe', status: 'paid',
    }));
    expect(response.status).toBe(200);
    expect(state.writes.find((row) => row.table === 'orders')?.payload.status).toBe('pending');
    expect(state.writes.find((row) => row.table === 'payments')?.payload).toMatchObject({
      status: 'pending', providerRef: null,
    });
  });

  it('A01: owner cannot mark an existing order paid', async () => {
    const response = await updateOrder(request('/api/orders/audit-order', { status: 'paid' }, 'PATCH'), {
      params: Promise.resolve({ id: 'audit-order' }),
    });
    expect(response.status).toBe(403);
    expect(state.writes.find((row) => row.table === 'payments')).toBeUndefined();
  });

  it('A02: Stripe receives the server quote rather than a client-supplied project price', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'audit-mocked-key');
    const saved = await saveProject(request('/api/projects', {
      projectId: 'audit-project', title: 'Underpriced', totalPriceCents: 100, currency: 'AUD',
      designState: { version: 1, widthMm: 1200, heightMm: 1000 },
    }));
    expect(saved.status).toBe(200);
    const order = await createOrder(request('/api/orders', {
      projectId: 'audit-project', paymentMethod: 'stripe',
    }));
    expect(order.status).toBe(200);
    const response = await checkout(request('/api/checkout/stripe', {
      projectId: 'audit-project', orderId: 'audit-order', customerEmail: 'audit@example.invalid',
    }));
    expect(response.status).toBe(200);
    expect(state.checkout?.line_items[0].price_data.unit_amount).toBe(110000);
  });

  it('A03: generic email endpoint rejects caller-supplied password reset links', async () => {
    state.session = null;
    const response = await email(request('/api/email', {
      type: 'password-reset', countryCode: 'au', recipientEmail: 'target@example.invalid',
      resetUrl: 'https://untrusted.example.invalid/reset',
    }));
    expect(response.status).toBe(403);
    expect(state.emails).toEqual([]);
  });

  it('A04: older background callback does not roll back a newer save', async () => {
    const save = (title: string) => saveProject(request('/api/projects', {
      projectId: 'audit-project', title, totalPriceCents: 110000,
      designState: { version: 1, inscriptions: [{ text: title }] },
    }));
    expect((await save('Older')).status).toBe(200);
    expect((await save('Newer')).status).toBe(200);
    await state.callbacks[2](); // Newer upload finishes first.
    expect(state.project.title).toBe('Newer');
    await state.callbacks[0](); // Older upload finishes later.
    expect(state.project.title).toBe('Newer');
    expect(state.project.designState.inscriptions[0].text).toBe('Newer');
  });

  it('A05: updating project changes total and pricing breakdown together', async () => {
    await saveProjectRecord({
      accountId: 'audit-owner', projectId: 'audit-project', title: 'Updated',
      totalPriceCents: 220000, designState: {} as DesignerSnapshot,
      pricingBreakdown: { total: 2200 },
    });
    expect(state.project.totalPriceCents).toBe(220000);
    expect(state.project.pricingBreakdown.total).toBe(2200);
  });

  it('A06: configured canonical site URL is retained without a deployment hostname', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://canonical.example.invalid');
    vi.stubEnv('VERCEL_URL', undefined);
    const response = await forgotPassword(request('/api/auth/forgot-password', { email: 'audit@example.invalid' }));
    expect(response.status).toBe(200);
    expect(state.emails[0].resetUrl).toMatch(/^https:\/\/canonical\.example\.invalid\/reset-password\//);
  });

  it('A06: configured canonical site URL takes precedence over deployment hostname', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://canonical.example.invalid');
    vi.stubEnv('VERCEL_URL', 'deployment.example.invalid');
    await forgotPassword(request('/api/auth/forgot-password', { email: 'audit@example.invalid' }));
    expect(state.emails[0].resetUrl).toMatch(/^https:\/\/canonical\.example\.invalid\//);
  });
});
