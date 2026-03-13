import { useMemo } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useProfile } from '@/hooks/useProfile';
import { formatCurrency, getMonthlyAmount, getCategoryInfo, CATEGORIES } from '@/lib/constants';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function InsightsPage() {
  const { subscriptions } = useSubscriptions();
  const { profile } = useProfile();
  const currency = profile?.preferred_currency ?? 'EUR';

  const active = subscriptions.filter(s => s.status === 'active');

  const monthlyTotal = useMemo(() =>
    active.reduce((sum, s) => sum + getMonthlyAmount(s.price, s.billing_cycle), 0)
  , [active]);

  const yearlyTotal = monthlyTotal * 12;

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach(s => {
      const cat = s.category || 'other';
      map[cat] = (map[cat] || 0) + getMonthlyAmount(s.price, s.billing_cycle);
    });
    return Object.entries(map)
      .map(([key, value]) => {
        const info = getCategoryInfo(key);
        return { name: info.label, value: Math.round(value * 100) / 100, color: info.color };
      })
      .sort((a, b) => b.value - a.value);
  }, [active]);

  const topExpensive = useMemo(() =>
    [...active]
      .sort((a, b) => getMonthlyAmount(b.price, b.billing_cycle) - getMonthlyAmount(a.price, a.billing_cycle))
      .slice(0, 5)
      .map(s => ({
        name: s.name.length > 12 ? s.name.slice(0, 12) + '...' : s.name,
        amount: Math.round(getMonthlyAmount(s.price, s.billing_cycle) * 100) / 100,
      }))
  , [active]);

  const paused = subscriptions.filter(s => s.status === 'paused');
  const pausedSavings = paused.reduce((sum, s) => sum + getMonthlyAmount(s.price, s.billing_cycle), 0);

  return (
    <div className="px-5 pb-24 pt-12">
      <h1 className="mb-5 text-[32px] font-black tracking-tight text-[#0F172A]">Insights</h1>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 rounded-[20px] gradient-hero p-6"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-white/80" />
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Monthly Spending
            </span>
          </div>
          <p className="text-4xl font-black text-white">
            {formatCurrency(monthlyTotal, currency)}
          </p>
          <p className="mt-1 text-sm text-white/80">
            on {active.length} active subscription{active.length !== 1 ? 's' : ''}
          </p>
          {pausedSavings > 0 && (
            <p className="mt-3 text-xs font-medium text-white/70">
              Saving {formatCurrency(pausedSavings, currency)}/mo by pausing {paused.length} sub{paused.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-4 card-elevated">
          <p className="text-xs text-[#64748B] mb-1">Yearly Projection</p>
          <p className="text-[28px] font-bold text-[#0F172A] leading-tight">{formatCurrency(yearlyTotal, currency)}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-[#22C55E] font-medium">
            <ArrowUpRight className="h-3 w-3" /> per year
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-4 card-elevated">
          <p className="text-xs text-[#64748B] mb-1">Avg per Sub</p>
          <p className="text-[28px] font-bold text-[#0F172A] leading-tight">
            {active.length ? formatCurrency(monthlyTotal / active.length, currency) : '\u2014'}
          </p>
          <div className="mt-2 text-xs text-[#64748B]">per month</div>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-5 p-5 card-elevated">
          <h3 className="text-sm font-semibold text-[#0F172A] mb-4">By Category</h3>
          <div className="flex items-center gap-4">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" innerRadius={30} outerRadius={55} paddingAngle={2} strokeWidth={0}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categoryData.slice(0, 4).map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: cat.color }} />
                    <span className="text-[#64748B]">{cat.name}</span>
                  </div>
                  <span className="font-medium text-[#0F172A]">{formatCurrency(cat.value, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Expensive */}
      {topExpensive.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="p-5 card-elevated">
          <h3 className="text-sm font-semibold text-[#0F172A] mb-4">Most Expensive (Monthly)</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topExpensive} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => formatCurrency(val, currency)}
                  contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="amount" fill="#22C55E" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {active.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-16 text-center">
          <div className="mb-4 text-5xl">📊</div>
          <p className="text-lg font-semibold text-[#0F172A]">No data yet</p>
          <p className="mt-1 text-sm text-[#64748B]">Add subscriptions to see spending insights</p>
        </motion.div>
      )}
    </div>
  );
}
