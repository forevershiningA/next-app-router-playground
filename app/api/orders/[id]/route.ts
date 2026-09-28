import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '#/lib/auth/session';
import { db } from '#/lib/db/index';
import { orders, payments } from '#/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession();
    if (!session?.accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as { status: 'cancelled' };

    if (body.status !== 'cancelled') {
      return NextResponse.json(
        { error: 'Payment status is managed by the payment provider' },
        { status: 403 },
      );
    }

    const updated = await db.transaction(async (tx) => {
      const [order] = await tx
        .update(orders)
        .set({ status: 'cancelled', updatedAt: new Date() })
        .where(
          and(
            eq(orders.id, id),
            eq(orders.accountId, session.accountId),
            eq(orders.status, 'pending'),
          ),
        )
        .returning();
      if (!order) return null;
      await tx
        .update(payments)
        .set({ status: 'cancelled' })
        .where(and(eq(payments.orderId, id), eq(payments.status, 'pending')));
      return order;
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Pending order not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, orderId: id });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 },
    );
  }
}
