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

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 rounded-2xl gradient-hero p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary-foreground dark:text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80 dark:text-primary/80">
              Monthly Spending
            </span>
          </div>
          <p className="text-4xl font-black text-primary-foreground dark:text-foreground">
            {formatCurrency(monthlyTotal, currency)}
          </p>
          <p className="mt-1 text-sm text-primary-foreground/80 dark:text-muted-foreground">
            on {active.length} active subscription{active.length !== 1 ? 's' : ''}
          </p>
          {pausedSavings > 0 && (
            <p className="mt-3 text-xs font-medium text-primary-foreground/70 dark:text-primary/70">
              💰 Saving {formatCurrency(pausedSavings, currency)}/mo by pausing {paused.length} sub{paused.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card p-4 card-shadow">
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
          className="mb-5 rounded-2xl bg-card p-5 card-shadow">
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
          className="rounded-2xl bg-card p-5 card-shadow">
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
                <Bar dataKey="amount" fill="hsl(142 71% 45%)" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
