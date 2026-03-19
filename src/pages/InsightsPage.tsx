import { useMemo } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useProfile } from '@/hooks/useProfile';
import { formatCurrency, getMonthlyAmount } from '@/lib/constants';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const CHART_COLORS = [
  'hsl(88 60% 50%)', 'hsl(88 65% 60%)', 'hsl(167 24% 52%)',
  'hsl(45 31% 28%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)',
  'hsl(262 52% 47%)', 'hsl(199 89% 48%)',
];

export default function InsightsPage() {
  const { subscriptions } = useSubscriptions();
  const { profile } = useProfile();
  const currency = profile?.preferred_currency ?? 'EUR';

  const active = subscriptions.filter(s => s.status === 'active');

  const monthlyTotal = useMemo(() =>
    active.reduce((sum, s) => sum + getMonthlyAmount(s.amount, s.billing_cycle), 0)
  , [active]);

  const yearlyTotal = monthlyTotal * 12;

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach(s => {
      const cat = s.category || 'Other';
      map[cat] = (map[cat] || 0) + getMonthlyAmount(s.amount, s.billing_cycle);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [active]);

  const topExpensive = useMemo(() =>
    [...active]
      .sort((a, b) => getMonthlyAmount(b.amount, b.billing_cycle) - getMonthlyAmount(a.amount, a.billing_cycle))
      .slice(0, 5)
      .map(s => ({
        name: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
        amount: Math.round(getMonthlyAmount(s.amount, s.billing_cycle) * 100) / 100,
      }))
  , [active]);

  const paused = subscriptions.filter(s => s.status === 'paused');
  const pausedSavings = paused.reduce((sum, s) => sum + getMonthlyAmount(s.amount, s.billing_cycle), 0);

  return (
    <div className="px-5 pb-24 pt-2">
      <h1 className="mb-5 text-[28px] font-black tracking-tight text-foreground">Insights</h1>

      {/* Spend summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 rounded-[20px] bg-primary p-5 relative overflow-hidden"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary-foreground/70" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/70">
                This Month
              </span>
            </div>
            <p className="text-[38px] font-black text-primary-foreground leading-none tracking-tight">
              {formatCurrency(monthlyTotal, currency)}
            </p>
            <p className="mt-2 text-sm text-primary-foreground/75">
              across {active.length} active subscription{active.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-foreground/15">
            <ArrowUpRight className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
        {pausedSavings > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary-foreground/15 px-3 py-2">
            <span className="text-sm">💰</span>
            <p className="text-xs font-medium text-primary-foreground/85">
              Saving {formatCurrency(pausedSavings, currency)}/mo from {paused.length} paused
            </p>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-4 glass-card">
          <p className="text-xs text-muted-foreground mb-1">Yearly Projection</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(yearlyTotal, currency)}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
            <ArrowUpRight className="h-3 w-3" /> per year
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="p-4 glass-card">
          <p className="text-xs text-muted-foreground mb-1">Avg per Sub</p>
          <p className="text-2xl font-bold text-foreground">
            {active.length ? formatCurrency(monthlyTotal / active.length, currency) : '—'}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">per month</div>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-5 p-5 glass-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">By Category</h3>
          <div className="flex items-center gap-4">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" innerRadius={30} outerRadius={55} paddingAngle={2} strokeWidth={0}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categoryData.slice(0, 4).map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{formatCurrency(cat.value, currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Expensive */}
      {topExpensive.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="p-5 glass-card">
          <h3 className="text-sm font-semibold text-foreground mb-4">Most Expensive (Monthly)</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topExpensive} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => formatCurrency(val, currency)}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="amount" fill="hsl(88 60% 50%)" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
