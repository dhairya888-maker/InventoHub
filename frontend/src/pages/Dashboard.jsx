import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertTriangle, Boxes, DollarSign, PackageCheck, ShoppingCart, Users } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { dashboardApi } from '../api';
import StatsCard from '../components/ui/StatsCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const statusClass = {
  pending: 'badge-pending',
  confirmed: 'badge-info',
  shipped: 'badge-warning',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

const chartTheme = {
  grid: 'rgba(148, 163, 184, 0.18)',
  axis: '#94a3b8',
  primary: '#635bff',
  cyan: '#22d3ee',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
};

function Panel({ title, eyebrow, children, action }) {
  return (
    <motion.section className="glass-card p-5" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="relative mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>{title}</h2>
        </div>
        {action}
      </div>
      <div className="relative">{children}</div>
    </motion.section>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard', 'stats'], queryFn: dashboardApi.stats });
  const { data: revenue, isLoading: revenueLoading } = useQuery({ queryKey: ['dashboard', 'revenue'], queryFn: () => dashboardApi.revenueChart(12) });
  const { data: trends, isLoading: trendsLoading } = useQuery({ queryKey: ['dashboard', 'trends'], queryFn: () => dashboardApi.orderTrends(12) });
  const { data: lowStock } = useQuery({ queryKey: ['dashboard', 'lowStock'], queryFn: dashboardApi.lowStock });
  const { data: recentOrders } = useQuery({ queryKey: ['dashboard', 'recentOrders'], queryFn: () => dashboardApi.recentOrders(10) });

  const distribution = useMemo(() => {
    const low = lowStock?.length || 0;
    const total = stats?.total_products || 0;
    const healthy = Math.max(total - low, 0);
    return [
      { name: 'Healthy', value: healthy, color: chartTheme.emerald },
      { name: 'Low stock', value: low, color: chartTheme.amber },
      { name: 'Watchlist', value: Math.max(Math.round(total * 0.12), low ? 1 : 0), color: chartTheme.primary },
    ].filter((item) => item.value > 0);
  }, [lowStock, stats]);

  const healthScore = stats?.total_products ? Math.max(0, Math.round(((stats.total_products - (lowStock?.length || 0)) / stats.total_products) * 100)) : 100;

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="card" count={4} />
        <div className="grid gap-6 xl:grid-cols-2">
          <SkeletonLoader type="chart" />
          <SkeletonLoader type="chart" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Products" value={stats?.total_products || 0} icon={Boxes} tone="indigo" trend="+8.2%" />
        <StatsCard title="Total Customers" value={stats?.total_customers || 0} icon={Users} tone="emerald" trend="+14.1%" />
        <StatsCard title="Total Orders" value={stats?.total_orders || 0} icon={ShoppingCart} tone="amber" trend="+9.7%" />
        <StatsCard title="Revenue" value={`$${Number(stats?.total_revenue || 0).toLocaleString()}`} icon={DollarSign} tone="rose" trend="+18.6%" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel
          eyebrow="Revenue intelligence"
          title="Monthly revenue trends"
          action={<span className="badge badge-success">Live forecast</span>}
        >
          {revenueLoading ? (
            <SkeletonLoader type="chart" />
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <AreaChart data={revenue || []}>
                <defs>
                  <linearGradient id="revenuePremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartTheme.primary} stopOpacity={0.45} />
                    <stop offset="70%" stopColor={chartTheme.cyan} stopOpacity={0.08} />
                    <stop offset="100%" stopColor={chartTheme.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: '1px solid var(--line)', borderRadius: 18, background: 'var(--panel-solid)', color: 'var(--text)', boxShadow: 'var(--shadow-xl)' }} />
                <Area type="monotone" dataKey="revenue" stroke={chartTheme.primary} strokeWidth={3} fill="url(#revenuePremium)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel eyebrow="Inventory health" title={`${healthScore}% operational health`}>
          <div className="mb-6 flex items-center justify-center">
            <div className="relative h-52 w-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution.length ? distribution : [{ name: 'Healthy', value: 1, color: chartTheme.emerald }]} dataKey="value" innerRadius={70} outerRadius={96} paddingAngle={4}>
                    {(distribution.length ? distribution : [{ color: chartTheme.emerald }]).map((entry) => (
                      <Cell key={entry.color} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-4xl font-extrabold" style={{ color: 'var(--text)' }}>{healthScore}%</p>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Healthy</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {distribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl border px-3 py-2" style={{ borderColor: 'var(--line)' }}>
                <span className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text)' }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                  {item.name}
                </span>
                <span className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel eyebrow="Demand movement" title="Order velocity">
          {trendsLoading ? (
            <SkeletonLoader type="chart" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trends || []}>
                <CartesianGrid stroke={chartTheme.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartTheme.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartTheme.axis, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ border: '1px solid var(--line)', borderRadius: 18, background: 'var(--panel-solid)', color: 'var(--text)' }} />
                <Bar dataKey="count" radius={[12, 12, 4, 4]} fill={chartTheme.cyan} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel eyebrow="Risk center" title="Low stock alerts">
          {!lowStock || lowStock.length === 0 ? (
            <div className="rounded-3xl border p-5 text-sm font-bold" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
              All products are comfortably stocked.
            </div>
          ) : (
            <div className="space-y-3">
              {lowStock.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center gap-3 rounded-3xl border p-3" style={{ borderColor: 'var(--line)' }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold" style={{ color: 'var(--text)' }}>{product.name}</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>{product.sku}</p>
                  </div>
                  <span className="badge badge-warning">{product.stock_quantity} left</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel eyebrow="Activity feed" title="Recent orders">
          {!recentOrders || recentOrders.length === 0 ? (
            <div className="rounded-3xl border p-5 text-sm font-bold" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
              No orders yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="flex items-center gap-3 rounded-3xl border p-3" style={{ borderColor: 'var(--line)' }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold" style={{ color: 'var(--text)' }}>{order.customer_name || 'Customer'}</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>${Number(order.total_amount).toFixed(2)}</p>
                  </div>
                  <span className={`badge ${statusClass[order.status] || 'badge-info'}`}>{order.status}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
