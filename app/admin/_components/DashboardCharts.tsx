'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  type PieLabelRenderProps,
} from 'recharts';

type TooltipValue = number | string | ReadonlyArray<number | string>;
type TooltipName = number | string;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MonthlyDataPoint {
  month: string; // e.g. "Jan 25"
  orders: number;
  revenueAud: number;
  customers: number;
  designs: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
}

// ── Colour palette ─────────────────────────────────────────────────────────────

const GOLD = '#DEBD68';
const BLUE = '#3b82f6';
const EMERALD = '#10b981';
const VIOLET = '#8b5cf6';
const AMBER = '#f59e0b';
const ROSE = '#f43f5e';
const CYAN = '#06b6d4';
const SLATE = '#94a3b8';

const STATUS_COLORS: Record<string, string> = {
  quote: AMBER,
  pending: AMBER,
  paid: EMERALD,
  approved: EMERALD,
  completed: EMERALD,
  responded: EMERALD,
  in_production: BLUE,
  produced: BLUE,
  shipped: VIOLET,
  draft: SLATE,
  cancelled: ROSE,
  failed: ROSE,
};

// ── Shared tooltip helpers ─────────────────────────────────────────────────────

function ChartWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Revenue & Orders area chart ────────────────────────────────────────────────

function revenueTooltipFormatter(value: TooltipValue | undefined, name: TooltipName | undefined) {
  const v = value as number;
  if (name === 'revenueAud') return [`$${v.toLocaleString('en-AU')}`, 'Revenue (AUD)'] as [string, string];
  if (name === 'orders') return [v, 'Orders'] as [number, string];
  return [v, String(name ?? '')] as [number, string];
}

export function RevenueOrdersChart({
  data,
}: {
  data: MonthlyDataPoint[];
}) {
  return (
    <ChartWrapper title="Revenue & Orders — last 12 months">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={GOLD} stopOpacity={0.35} />
              <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={BLUE} stopOpacity={0.25} />
              <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="rev"
            orientation="left"
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <YAxis
            yAxisId="cnt"
            orientation="right"
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            formatter={revenueTooltipFormatter}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.08)',
              fontSize: 12,
            }}
          />
          <Legend
            formatter={(value) =>
              value === 'revenueAud' ? 'Revenue (AUD)' : 'Orders'
            }
            wrapperStyle={{ fontSize: 11 }}
          />
          <Area
            yAxisId="rev"
            type="monotone"
            dataKey="revenueAud"
            stroke={GOLD}
            strokeWidth={2}
            fill="url(#gradRevenue)"
          />
          <Area
            yAxisId="cnt"
            type="monotone"
            dataKey="orders"
            stroke={BLUE}
            strokeWidth={2}
            fill="url(#gradOrders)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ── Order status donut ─────────────────────────────────────────────────────────

function statusLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function OrderStatusChart({ data }: { data: StatusBreakdown[] }) {
  const FALLBACK_COLORS = [GOLD, BLUE, EMERALD, VIOLET, AMBER, ROSE, CYAN, SLATE];

  return (
    <ChartWrapper title="Orders by status">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            label={(props: PieLabelRenderProps) => {
              const pct = Number(props.percent ?? 0);
              const name = String(props.name ?? '');
              return pct > 0.05
                ? `${statusLabel(name)} ${(pct * 100).toFixed(0)}%`
                : undefined;
            }}
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: TooltipValue | undefined, name: TooltipName | undefined) =>
              [value, statusLabel(String(name ?? ''))] as [TooltipValue, string]
            }
            contentStyle={{ borderRadius: '8px', fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ── New customers bar chart ────────────────────────────────────────────────────

export function CustomersChart({ data }: { data: MonthlyDataPoint[] }) {
  return (
    <ChartWrapper title="New customers — last 12 months">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(v: TooltipValue | undefined) =>
              [v, 'New customers'] as [TooltipValue, string]
            }
            contentStyle={{ borderRadius: '8px', fontSize: 12 }}
          />
          <Bar dataKey="customers" fill={EMERALD} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ── New designs bar chart ──────────────────────────────────────────────────────

export function DesignsChart({ data }: { data: MonthlyDataPoint[] }) {
  return (
    <ChartWrapper title="New designs — last 12 months">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(v: TooltipValue | undefined) =>
              [v, 'Designs'] as [TooltipValue, string]
            }
            contentStyle={{ borderRadius: '8px', fontSize: 12 }}
          />
          <Bar dataKey="designs" fill={VIOLET} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
