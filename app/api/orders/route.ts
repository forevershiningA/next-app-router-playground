import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '#/lib/auth/session';
import { db } from '#/lib/db/index';
import { orders, orderItems, payments } from '#/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getProjectRecord } from '#/lib/projects-db';

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${y}${m}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as {
      projectId: string;
      paymentMethod: 'stripe' | 'paypal' | 'other';
      paymentRef?: string;
      status?: 'pending' | 'paid';
    };

    const { projectId, paymentMethod, paymentRef, status = 'pending' } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const project = await getProjectRecord(projectId, session.accountId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const amountCents = project.totalPriceCents ?? 0;
    const currency = project.currency ?? 'AUD';

    if (amountCents <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const taxCents = Math.round(amountCents * 0.1);
    const subtotalCents = amountCents - taxCents;

    const [order] = await db
      .insert(orders)
      .values({
        projectId,
        accountId: session.accountId,
        status: status === 'paid' ? 'paid' : 'pending',
        subtotalCents,
        taxCents,
        totalCents: amountCents,
        currency,
        invoiceNumber: generateInvoiceNumber(),
      })
      .returning();

    await db.insert(orderItems).values({
      orderId: order.id,
      description: project.title,
      quantity: 1,
      unitPriceCents: amountCents,
    });

    await db.insert(payments).values({
      orderId: order.id,
      provider: paymentMethod,
      providerRef: paymentRef ?? null,
      amountCents,
      currency,
      status: status === 'paid' ? 'completed' : 'pending',
      receivedAt: status === 'paid' ? new Date() : null,
    });

    return NextResponse.json({ orderId: order.id, invoiceNumber: order.invoiceNumber });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
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

        return {
          ...order,
          items,
          payments: orderPayments,
        };
      })
    );

    return NextResponse.json({ orders: ordersWithDetails });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
