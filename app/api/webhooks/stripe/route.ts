import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { and, eq } from 'drizzle-orm';
import { db } from '#/lib/db/index';
import { orders, payments } from '#/lib/db/schema';

export const runtime = 'nodejs';

const completedEventTypes = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
]);

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');

  if (!secretKey || !webhookSecret || !signature) {
    return NextResponse.json(
      { error: 'Webhook is not configured' },
      { status: 400 },
    );
  }

  let event: {
    type: string;
    data: {
      object: {
        id: string;
        metadata?: Record<string, string> | null;
        payment_status?: string;
        amount_total?: number | null;
        currency?: string | null;
      };
    };
  };
  try {
    const payload = await request.text();
    event = new Stripe(secretKey).webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    ) as unknown as typeof event;
  } catch (error) {
    console.warn('[stripe webhook] Invalid signature:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (!completedEventTypes.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  const checkout = event.data.object;
  const orderId = checkout.metadata?.orderId;
  const accountId = checkout.metadata?.accountId;
  if (!orderId || !accountId || checkout.payment_status !== 'paid') {
    return NextResponse.json({ received: true });
  }

  const order = await db.query.orders.findFirst({
    where: and(
      eq(orders.id, orderId),
      eq(orders.accountId, accountId),
      eq(orders.status, 'pending'),
    ),
  });

  if (!order) {
    return NextResponse.json({ received: true });
  }

  const amountMatches = checkout.amount_total === order.totalCents;
  const currencyMatches =
    checkout.currency?.toUpperCase() === order.currency.toUpperCase();
  if (!amountMatches || !currencyMatches) {
    console.error(
      '[stripe webhook] Checkout amount or currency did not match order',
      { orderId, checkoutId: checkout.id },
    );
    return NextResponse.json({ received: true });
  }

  const now = new Date();
  const [updated] = await db
    .update(orders)
    .set({ status: 'paid', paidAt: now, updatedAt: now })
    .where(and(eq(orders.id, orderId), eq(orders.status, 'pending')))
    .returning();

  if (updated) {
    await db
      .update(payments)
      .set({ status: 'completed', providerRef: checkout.id, receivedAt: now })
      .where(
        and(eq(payments.orderId, orderId), eq(payments.provider, 'stripe')),
      );
  }

  return NextResponse.json({ received: true });
}
