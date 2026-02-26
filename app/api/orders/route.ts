import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '#/lib/auth/session';
import { db } from '#/lib/db';
import { orders, orderItems, payments } from '#/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
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
