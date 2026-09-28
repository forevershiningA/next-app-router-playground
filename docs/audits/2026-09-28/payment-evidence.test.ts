// Reproductions: passing confirms the reported behavior, not production readiness.
// Real route handlers; isolated database, session, pricing and Stripe doubles.
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PgDialect } from 'drizzle-orm/pg-core';
import type { SQL } from 'drizzle-orm';

const state = vi.hoisted(() => ({
  order: { id: 'audit-order', accountId: 'audit-owner', status: 'pending', totalCents: 110000, currency: 'AUD' } as Record<string, unknown>,
  payment: { status: 'pending' } as Record<string, unknown>,
  failPayment: false,
  writes: 0,
}));
vi.mock('#/lib/auth/session', () => ({ getServerSession: async () => ({ accountId: 'audit-owner' }) }));
vi.mock('#/lib/projects-db', () => ({ getProjectRecord: async () => ({ title: 'Audit', designState: {} }) }));
vi.mock('#/lib/server/design-pricing', () => ({ calculateAuthoritativeQuote: async () => ({ totalCents: 110000, currency: 'AUD', breakdown: { subtotal: 1000, tax: 100 } }) }));
vi.mock('stripe', () => ({ default: class {
  webhooks = { constructEvent: () => ({ type: 'checkout.session.completed', data: { object: { id: 'cs_audit', metadata: { orderId: 'audit-order', accountId: 'audit-owner' }, payment_status: 'paid', amount_total: 110000, currency: 'aud' } } }) };
} }));
vi.mock('#/lib/db/index', async () => {
  const { orders, payments } = await import('#/lib/db/schema');
  const matches = (where: SQL) => {
    const { params } = new PgDialect().sqlToQuery(where);
    return !params.includes('pending') || state.order.status === 'pending';
  };
  return { db: {
    query: { orders: { findFirst: async ({ where }: { where: SQL }) => matches(where) ? { ...state.order } : undefined } },
    update: (table: unknown) => ({ set: (values: Record<string, unknown>) => ({ where: (where: SQL) => {
      // Returning builders are awaited by orders; payments use a directly awaited thenable.
      const run = async () => {
        if (table === payments && state.failPayment) throw new Error('simulated payment write outage');
        if (table === orders && !matches(where)) return [];
        state.writes++;
        if (table === orders) Object.assign(state.order, values);
        if (table === payments) Object.assign(state.payment, values);
        return [{ ...state.order }];
      };
      return { returning: run, then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => run().then(resolve, reject) };
    } }) }),
    insert: () => ({ values: () => { state.writes++; return { returning: async () => [state.order] }; } }),
  } };
});

import { POST as createOrder } from '#/app/api/orders/route';
import { PATCH as updateOrder } from '#/app/api/orders/[id]/route';
import { POST as webhook } from '#/app/api/webhooks/stripe/route';

beforeEach(() => {
  state.order = { id: 'audit-order', accountId: 'audit-owner', status: 'pending', totalCents: 110000, currency: 'AUD' };
  state.payment = { status: 'pending' };
  state.failPayment = false;
  state.writes = 0;
  vi.stubEnv('STRIPE_SECRET_KEY', 'mock-key');
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'mock-webhook-secret');
});
afterEach(() => vi.unstubAllEnvs());

it('T02: PayPal payload currently submitted by checkout is rejected before saving an order', async () => {
  const response = await createOrder(new NextRequest('https://audit.example.invalid/api/orders', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ projectId: 'audit-project', paymentMethod: 'paypal', paymentRef: 'mock-capture', status: 'paid' }),
  }));
  expect(response.status).toBe(400);
  expect(state.writes).toBe(0);
});

it('T04: owner cancellation can overwrite a paid order and completed payment', async () => {
  state.order.status = 'paid';
  state.payment.status = 'completed';
  const response = await updateOrder(new NextRequest('https://audit.example.invalid/api/orders/audit-order', {
    method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }),
  }), { params: Promise.resolve({ id: 'audit-order' }) });
  expect(response.status).toBe(200);
  expect(state.order.status).toBe('cancelled');
  expect(state.payment.status).toBe('cancelled');
});

it('T05: webhook retry cannot repair payment after order update succeeded but payment write failed', async () => {
  const event = () => new Request('https://audit.example.invalid/api/webhooks/stripe', {
    method: 'POST', headers: { 'stripe-signature': 'mock-signature' }, body: 'mocked event',
  });
  state.failPayment = true;
  await expect(webhook(event())).rejects.toThrow('simulated payment write outage');
  expect(state.order.status).toBe('paid');
  expect(state.payment.status).toBe('pending');
  state.failPayment = false;
  expect((await webhook(event())).status).toBe(200);
  expect(state.payment.status).toBe('pending');
});
