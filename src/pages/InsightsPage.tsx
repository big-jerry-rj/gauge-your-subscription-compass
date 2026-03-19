import { useMemo } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useProfile } from '@/hooks/useProfile';
import { formatCurrency, getMonthlyAmount } from '@/lib/constants';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, AlertCircle, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

const CHART_COLORS = [
  'hsl(88 60% 50%)', 'hsl(167 24% 52%)', 'hsl(199 89% 48%)',
  'hsl(262 52% 47%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)',
  'hsl(45 31% 42%)', 'hsl(320 60% 52%)',
];

export default function InsightsPage() {
  const { subscriptions } = useSubscriptions();
  const { profile } = useProfile();
  const currency = profile?.preferred_currency ?? 'EUR';

  const active = subscriptions.filter(s => s.status === 'active');
  const paused = subscriptions.filter(s => s.status === 'paused');

  const monthlyTotal = useMemo(() =>
    active.reduce((sum, s) => sum + getMonthlyAmount(s.amount, s.billing_cycle), 0)
  , [active]);

  const yearlyTotal = monthlyTotal * 12;

  const pausedSavings = paused.reduce((sum, s) => sum + getMonthlyAmount(s.amount, s.billing_cycle), 0);

  // Upcoming renewals in next 7 days
  const upcomingRenewals = useMemo(() => {
    return active
      .filter(s => {
        if (!s.next_billing_date) return false;
        const days = differenceInDays(new Date(s.next_billing_date), new Date());
        return days >= 0 && days <= 7;
      })
      .sort((a, b) => new Date(a.next_billing_date!).getTime() - new Date(b.next_billing_date!).getTime());
  }, [active]);

  const upcomingTotal = upcomingRenewals.reduce((sum, s) => sum + s.amount, 0);

  // Largest subscription by monthly equivalent
  const largestSub = useMemo(() =>
    active.length
      ? [...active].sort((a, b) =>
          getMonthlyAmount(b.amount, b.billing_cycle) - getMonthlyAmount(a.amount, a.billing_cycle)
        )[0]
      : null
  , [active]);

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
        name: s.name.length > 11 ? s.name.slice(0, 11) + '…' : s.name,
        amount: Math.round(getMonthlyAmount(s.amount, s.billing_cycle) * 100) / 100,
      }))
  , [active]);

  return (
    <div className="px-5 pb-28">
      {/* Page header */}
      <div className="pt-8 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/50 mb-1">Gauge</p>
        <h1 className="text-[32px] font-black tracking-tight text-foreground leading-none">Insights</h1>
      </div>

      {active.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/60">
            <TrendingUp className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <p className="text-base font-bold text-foreground">No data yet</p>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-[200px] leading-relaxed">
            Add subscriptions to unlock spending insights.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Hero — monthly spend */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-[22px] bg-primary p-5 relative overflow-hidden">
            {/* Decorative circle */}
            <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/[0.06]" />
            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/[0.04]" />
            <div className="relative">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground/55 mb-2">
                    Monthly Spend
                  </p>
                  <p className="text-[42px] font-black text-primary-foreground leading-none tracking-tight">
                    {formatCurrency(monthlyTotal, currency)}
                  </p>
                  <p className="mt-2 text-sm text-primary-foreground/65">
                    {active.length} active subscription{active.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.15]">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              {pausedSavings > 0 && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/[0.12] px-3 py-2">
                  <span className="text-sm">💰</span>
                  <p className="text-xs font-semibold text-primary-foreground/75">
                    Saving {formatCurrency(pausedSavings, currency)}/mo — {paused.length} paused
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick stats 2-up */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Yearly', value: formatCurrency(yearlyTotal, currency), sub: 'projected', delay: 0.08 },
              { label: 'Avg / Sub', value: active.length ? formatCurrency(monthlyTotal / active.length, currency) : '—', sub: 'per month', delay: 0.12 },
            ].map(stat => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay }} className="relative rounded-[20px] border border-border/40">
                <GlowingEffect spread={25} glow={false} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                <div className="relative glass-card rounded-[20px] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-[20px] font-bold text-foreground">{stat.value}</p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-primary font-semibold">
                    <ArrowUpRight className="h-3 w-3" />{stat.sub}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Upcoming renewals — next 7 days */}
          {upcomingRenewals.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="mb-4 relative rounded-[20px] border border-border/40">
              <GlowingEffect spread={25} glow={false} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
              <div className="relative glass-card rounded-[20px] p-4">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-warning/12">
                      <AlertCircle className="h-3.5 w-3.5 text-warning" />
                    </div>
                    <span className="text-[13px] font-bold text-foreground">Due this week</span>
                  </div>
                  <span className="text-[12px] font-bold text-warning">
                    {formatCurrency(upcomingTotal, currency)}
                  </span>
                </div>
                <div className="space-y-3">
                  {upcomingRenewals.map(sub => {
                    const days = differenceInDays(new Date(sub.next_billing_date!), new Date());
                    return (
                      <div key={sub.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            'h-2 w-2 rounded-full shrink-0',
                            days === 0 ? 'bg-destructive' : days <= 2 ? 'bg-warning' : 'bg-primary'
                          )} />
                          <span className="text-[13px] font-medium text-foreground">{sub.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-muted-foreground">
                            {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days}d`}
                          </span>
                          <span className="text-[13px] font-bold text-foreground tabular-nums">
                            {formatCurrency(sub.amount, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Largest subscription */}
          {largestSub && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className="mb-4 relative rounded-[20px] border border-border/40">
              <GlowingEffect spread={25} glow={false} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
              <div className="relative glass-card rounded-[20px] p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-[13px] font-bold text-foreground">Largest subscription</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {largestSub.logo_url ? (
                        <img src={largestSub.logo_url} alt={largestSub.name} className="h-6 w-6 object-contain" />
                      ) : (
                        <span className="text-base font-bold text-primary">{largestSub.name[0]}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-foreground">{largestSub.name}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{largestSub.billing_cycle}</p>
                    </div>
                  </div>
                  <p className="text-[18px] font-black text-foreground">
                    {formatCurrency(largestSub.amount, currency)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Category breakdown */}
          {categoryData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              className="mb-4 relative rounded-[20px] border border-border/40">
              <GlowingEffect spread={25} glow={false} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
              <div className="relative glass-card rounded-[20px] p-5">
                <h3 className="text-[13px] font-bold text-foreground mb-4">Spend by Category</h3>
                <div className="flex items-center gap-4">
                  <div className="h-32 w-32 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} dataKey="value" innerRadius={28} outerRadius={52} paddingAngle={3} strokeWidth={0}>
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
                          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-muted-foreground truncate max-w-[80px]">{cat.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">{formatCurrency(cat.value, currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Most expensive bar chart */}
          {topExpensive.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
              className="relative rounded-[20px] border border-border/40">
              <GlowingEffect spread={25} glow={false} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
              <div className="relative glass-card rounded-[20px] p-5">
                <h3 className="text-[13px] font-bold text-foreground mb-4">Monthly Cost Ranking</h3>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topExpensive} layout="vertical" margin={{ right: 8 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={78} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(val: number) => formatCurrency(val, currency)}
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                        cursor={{ fill: 'rgba(163,230,53,0.04)' }}
                      />
                      <Bar dataKey="amount" fill="hsl(88 60% 50%)" radius={[0, 6, 6, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
