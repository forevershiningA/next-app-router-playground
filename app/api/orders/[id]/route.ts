import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '#/lib/auth/session';
import { db } from '#/lib/db/index';
import { orders, payments } from '#/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as {
      status: 'pending' | 'paid' | 'cancelled';
      paymentRef?: string;
    };

    const { status, paymentRef } = body;

    const [updated] = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(orders.id, id), eq(orders.accountId, session.accountId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update related payment record too
    await db
      .update(payments)
      .set({
        status: status === 'paid' ? 'completed' : status,
        ...(paymentRef ? { providerRef: paymentRef } : {}),
        ...(status === 'paid' ? { receivedAt: new Date() } : {}),
      })
      .where(eq(payments.orderId, id));

    return NextResponse.json({ success: true, orderId: id });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
