import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '#/lib/auth/session';
import { db } from '#/lib/db/index';
import { orders, orderItems, payments } from '#/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getProjectRecord } from '#/lib/projects-db';
import { calculateAuthoritativeQuote } from '#/lib/server/design-pricing';

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${y}${m}-${rand}`;
}

function isLocalRequest(request: NextRequest): boolean {
  const hostname = new URL(request.url).hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      projectId: string;
      paymentMethod: 'stripe' | 'other';
      testOrder?: boolean;
    };

    const { projectId, paymentMethod } = body;
    const isTestOrder = body.testOrder === true && isLocalRequest(request);

    if (!projectId || !['stripe', 'other'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const project = await getProjectRecord(projectId, session.accountId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let quote;
    try {
      quote = await calculateAuthoritativeQuote(project.designState);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Could not calculate order price',
        },
        { status: 422 },
      );
    }

    const totalCents = isTestOrder ? 100 : quote.totalCents;
    const subtotalCents = isTestOrder
      ? 100
      : Math.round(quote.breakdown.subtotal! * 100);
    const taxCents = isTestOrder ? 0 : Math.round(quote.breakdown.tax! * 100);

    const [order] = await db
      .insert(orders)
      .values({
        projectId,
        accountId: session.accountId,
        status: 'pending',
        subtotalCents,
        taxCents,
        totalCents,
        currency: quote.currency,
        invoiceNumber: generateInvoiceNumber(),
      })
      .returning();

    await db
      .insert(orderItems)
      .values({
        orderId: order.id,
        description: project.title,
        quantity: 1,
        unitPriceCents: totalCents,
      });

    await db
      .insert(payments)
      .values({
        orderId: order.id,
        provider: paymentMethod,
        providerRef: null,
        amountCents: totalCents,
        currency: quote.currency,
        status: 'pending',
        receivedAt: null,
      });

    return NextResponse.json({
      orderId: order.id,
      invoiceNumber: order.invoiceNumber,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 },
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch orders with related data
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.accountId, session.accountId),
      orderBy: [desc(orders.createdAt)],
      with: {
        // This will only work if you have relations defined in schema
        // For now, we'll fetch them separately
      },
    });

    // Fetch order items and payments for each order
    const ordersWithDetails = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db.query.orderItems.findMany({
          where: eq(orderItems.orderId, order.id),
        });

        const orderPayments = await db.query.payments.findMany({
          where: eq(payments.orderId, order.id),
        });

        return { ...order, items, payments: orderPayments };
      }),
    );

    return NextResponse.json({ orders: ordersWithDetails });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 },
    );
  }
}
