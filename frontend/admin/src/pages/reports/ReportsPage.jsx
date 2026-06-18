import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import reportService from '../../services/reportService';

/* ---------------------------------------------------------------------- */
/* Icons — small inline SVGs so no new icon dependency is introduced      */
/* ---------------------------------------------------------------------- */

const IconOrders = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 7h12l1 13H5L6 7Z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
);

const IconRevenue = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1v22" />
    <path d="M17 5.5C17 3.5 14.8 2 12 2S7 3.5 7 5.8c0 4 10 1.5 10 5.7 0 2.5-2.7 3.5-5 3.5s-5.3-1-5.3-3.5" />
  </svg>
);

const IconAOV = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M16 7h5v5" />
  </svg>
);

const IconDiscount = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41 13 21l-9-9V4h8l8.59 8.59a2 2 0 0 1 0 2.82Z" />
    <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

const IconUsers = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.5 21v-1.5a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4V21" />
    <circle cx="9.5" cy="8" r="3.3" />
    <path d="M16 9.3a3 3 0 1 0-1.7-5.5" />
    <path d="M20 21v-1.5a3.3 3.3 0 0 0-2.3-3.2" />
  </svg>
);

const IconUserPlus = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.5 21v-1.5a4 4 0 0 0-4-4h-3a4 4 0 0 0-4 4V21" />
    <circle cx="8" cy="8" r="3.3" />
    <path d="M18.5 8.5v5" />
    <path d="M16 11h5" />
  </svg>
);

const IconCart = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="20" r="1" fill="currentColor" stroke="none" />
    <circle cx="18" cy="20" r="1" fill="currentColor" stroke="none" />
    <path d="M2.5 3h2.3l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7.5H5.6" />
  </svg>
);

const IconEmpty = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <rect x="7" y="13" width="3" height="5" rx="0.5" />
    <rect x="12" y="9" width="3" height="9" rx="0.5" />
    <rect x="17" y="6" width="3" height="12" rx="0.5" />
  </svg>
);

/* ---------------------------------------------------------------------- */
/* Stat card                                                               */
/* ---------------------------------------------------------------------- */

const STAT_THEME = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  purple: { bg: 'bg-violet-50', text: 'text-violet-600' },
  yellow: { bg: 'bg-amber-50', text: 'text-amber-600' },
};

function StatCard({ title, value, color = 'blue', icon: Icon }) {
  const theme = STAT_THEME[color] || STAT_THEME.blue;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2 tabular-nums">{value}</p>
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg ${theme.bg} ${theme.text} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Loading skeleton — mirrors the real layout instead of a generic spinner */
/* ---------------------------------------------------------------------- */

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function ReportsSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-4 w-64 mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <Skeleton className="h-5 w-48 mb-6" />
        <Skeleton className="h-[300px] w-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <Skeleton className="h-5 w-40 mb-6" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <Skeleton className="h-5 w-32 mb-6" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Page                                                                    */
/* ---------------------------------------------------------------------- */

export function ReportsPage() {
  const [sales, setSales] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerSummary, setCustomerSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportService.getSalesSummary(30),
      reportService.getDailySales(30),
      reportService.getTopProducts(30, 10),
      reportService.getCustomerSummary(),
    ]).then(([s, ds, tp, cs]) => {
      setSales(s.data);
      setDailySales(ds.data);
      setTopProducts(tp.data);
      setCustomerSummary(cs.data);
    }).catch(() => { }).finally(() => setLoading(false));
  }, []);

  if (loading) return <ReportsSkeleton />;

  const maxProductRevenue = Math.max(...topProducts.map((p) => p.total_revenue), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Performance overview for the last 30 days</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Orders" value={sales?.total_orders || 0} color="blue" icon={IconOrders} />
        <StatCard title="Revenue" value={`$${(sales?.total_revenue || 0).toFixed(2)}`} color="green" icon={IconRevenue} />
        <StatCard title="Avg Order Value" value={`$${(sales?.average_order_value || 0).toFixed(2)}`} color="purple" icon={IconAOV} />
        <StatCard title="Discounts" value={`$${(sales?.total_discount || 0).toFixed(2)}`} color="yellow" icon={IconDiscount} />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-gray-900">Revenue Overview</h2>
          <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">Last 30 days</span>
        </div>
        <div className="h-[320px]">
          {dailySales.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <IconEmpty className="w-8 h-8" />
              <p className="text-sm">No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#f1f5f9' }} />
                <YAxis tickFormatter={(val) => `$${val}`} tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={56} />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Customer Summary</h2>
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="flex flex-col items-start pr-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <IconUsers className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-gray-900 tabular-nums">{customerSummary?.total_customers || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total Customers</p>
            </div>
            <div className="flex flex-col items-start px-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <IconUserPlus className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-gray-900 tabular-nums">{customerSummary?.new_customers_30d || 0}</p>
              <p className="text-xs text-gray-500 mt-1">New (30d)</p>
            </div>
            <div className="flex flex-col items-start pl-4">
              <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
                <IconCart className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold text-gray-900 tabular-nums">{customerSummary?.total_orders || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total Orders</p>
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Top Products</h2>
          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-2 py-10">
              <IconEmpty className="w-8 h-8" />
              <p className="text-sm">No data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={p.product_id}>
                  <div className="flex items-center justify-between mb-1.5 gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{i + 1}</span>
                      <span className="font-medium text-sm text-gray-900 truncate">{p.product_name}</span>
                    </div>
                    <div className="text-right text-sm shrink-0">
                      <span className="font-semibold text-gray-900">${p.total_revenue.toFixed(2)}</span>
                      <span className="text-gray-400 ml-2">{p.total_quantity} sold</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-6">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.max((p.total_revenue / maxProductRevenue) * 100, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}