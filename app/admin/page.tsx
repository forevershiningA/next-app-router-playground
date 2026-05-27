import Link from 'next/link';
import { count, desc, eq, sql } from 'drizzle-orm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };
import { db } from '#/lib/db/index';
import {
  accounts,
  enquiries,
  orders,
  profiles,
  projects,
} from '#/lib/db/schema';
import {
  EmptyState,
  PageIntro,
  SectionCard,
  StatCard,
  StatusBadge,
  formatDate,
  formatMoney,
  getDisplayName,
  requireAdminSession,
} from './_components/admin-utils';
import {
  RevenueOrdersChart,
  OrderStatusChart,
  CustomersChart,
  DesignsChart,
  type MonthlyDataPoint,
  type StatusBreakdown,
} from './_components/DashboardCharts';

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const [
    totalOrdersResult,
    totalCustomersResult,
    totalDesignsResult,
    totalEnquiriesResult,
    newEnquiriesResult,
    recentOrders,
    monthlyOrdersRaw,
    monthlyCustomersRaw,
    monthlyDesignsRaw,
    orderStatusRaw,
  ] = await Promise.all([
    db.select({ value: count() }).from(orders),
    db
      .select({ value: count() })
      .from(accounts)
      .where(eq(accounts.role, 'client')),
    db.select({ value: count() }).from(projects),
    db.select({ value: count() }).from(enquiries),
    db
      .select({ value: count() })
      .from(enquiries)
      .where(eq(enquiries.status, 'new')),
    db
      .select({
        id: orders.id,
        invoiceNumber: orders.invoiceNumber,
        status: orders.status,
        totalCents: orders.totalCents,
        createdAt: orders.createdAt,
        email: accounts.email,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        organization: profiles.organization,
      })
      .from(orders)
      .leftJoin(accounts, eq(orders.accountId, accounts.id))
      .leftJoin(profiles, eq(accounts.id, profiles.accountId))
      .orderBy(desc(orders.createdAt))
      .limit(10),
    // Orders + revenue per month (last 12 months)
    db.execute(sql`
      SELECT
        to_char(date_trunc('month', created_at), 'Mon YY') AS month,
        date_trunc('month', created_at) AS month_start,
        COUNT(*)::int AS orders,
        COALESCE(SUM(total_cents), 0)::int AS revenue_cents
      FROM orders
      WHERE created_at >= date_trunc('month', now()) - INTERVAL '11 months'
      GROUP BY month_start, month
      ORDER BY month_start
    `),
    // New client accounts per month (last 12 months)
    db.execute(sql`
      SELECT
        to_char(date_trunc('month', created_at), 'Mon YY') AS month,
        date_trunc('month', created_at) AS month_start,
        COUNT(*)::int AS customers
      FROM accounts
      WHERE role = 'client'
        AND created_at >= date_trunc('month', now()) - INTERVAL '11 months'
      GROUP BY month_start, month
      ORDER BY month_start
    `),
    // New designs/projects per month (last 12 months)
    db.execute(sql`
      SELECT
        to_char(date_trunc('month', created_at), 'Mon YY') AS month,
        date_trunc('month', created_at) AS month_start,
        COUNT(*)::int AS designs
      FROM projects
      WHERE created_at >= date_trunc('month', now()) - INTERVAL '11 months'
      GROUP BY month_start, month
      ORDER BY month_start
    `),
    // Order counts by status
    db.execute(sql`
      SELECT status, COUNT(*)::int AS count
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `),
  ]);

  const totalOrders = Number(totalOrdersResult[0]?.value ?? 0);
  const totalCustomers = Number(totalCustomersResult[0]?.value ?? 0);
  const totalDesigns = Number(totalDesignsResult[0]?.value ?? 0);
  const totalEnquiries = Number(totalEnquiriesResult[0]?.value ?? 0);
  const newEnquiries = Number(newEnquiriesResult[0]?.value ?? 0);

  // Build a keyed map so we can merge the three time-series by month label
  type RawRow = Record<string, unknown>;

  const ordersMap = new Map<string, { orders: number; revenueAud: number }>();
  for (const row of monthlyOrdersRaw as RawRow[]) {
    ordersMap.set(String(row.month), {
      orders: Number(row.orders),
      revenueAud: Math.round(Number(row.revenue_cents) / 100),
    });
  }

  const customersMap = new Map<string, number>();
  for (const row of monthlyCustomersRaw as RawRow[]) {
    customersMap.set(String(row.month), Number(row.customers));
  }

  const designsMap = new Map<string, number>();
  for (const row of monthlyDesignsRaw as RawRow[]) {
    designsMap.set(String(row.month), Number(row.designs));
  }

  // Generate the last 12 calendar months as labels
  const monthLabels: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(
      d.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' }),
    );
  }

  const monthlyData: MonthlyDataPoint[] = monthLabels.map((m) => ({
    month: m,
    orders: ordersMap.get(m)?.orders ?? 0,
    revenueAud: ordersMap.get(m)?.revenueAud ?? 0,
    customers: customersMap.get(m) ?? 0,
    designs: designsMap.get(m) ?? 0,
  }));

  const orderStatusData: StatusBreakdown[] = (orderStatusRaw as RawRow[]).map(
    (row) => ({ status: String(row.status), count: Number(row.count) }),
  );

  return (
    <div className="space-y-8 px-6 pb-8 pt-0 md:px-8">
      <PageIntro
        title="Dashboard"
        description="Monitor orders, customers, memorial designs, and incoming enquiries."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Orders" value={totalOrders} />
        <StatCard
          label="Customers"
          value={totalCustomers}
          detail="Non-admin accounts"
        />
        <StatCard label="Designs" value={totalDesigns} />
        <StatCard label="Enquiries" value={totalEnquiries} />
        <StatCard
          label="New Enquiries"
          value={newEnquiries}
          detail="Awaiting response"
        />
      </div>

      {/* Charts row 1 — revenue/orders + status donut */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueOrdersChart data={monthlyData} />
        </div>
        <OrderStatusChart data={orderStatusData} />
      </div>

      {/* Charts row 2 — customers + designs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <CustomersChart data={monthlyData} />
        <DesignsChart data={monthlyData} />
      </div>

      <SectionCard className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent orders
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Latest 10 memorial orders
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState message="No orders have been placed yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Customer
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">Total</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-gray-900 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-300"
                      >
                        {order.invoiceNumber || 'Draft invoice'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      <div>{getDisplayName(order)}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {order.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {formatMoney(order.totalCents)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
