import { useMemo } from 'react';
import { Subscription } from '@/hooks/useSubscriptions';
import { formatCurrency, getMonthlyAmount } from '@/lib/constants';
import { format, subMonths, endOfMonth } from 'date-fns';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  subscriptions: Subscription[];
  currency: string;
}

export default function SpendingTrajectoryModule({ subscriptions, currency }: Props) {
  const monthlyHistory = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthEnd = endOfMonth(date);
      const total = subscriptions
        .filter(s => s.status === 'active')
        .filter(s => s.start_date && new Date(s.start_date) <= monthEnd)
        .reduce((sum, s) => sum + getMonthlyAmount(s.amount, s.billing_cycle), 0);
      months.push({
        month: format(date, 'MMM'),
        total: Math.round(total * 100) / 100,
      });
    }
    return months;
  }, [subscriptions]);

  const velocityData = useMemo(() => {
    if (monthlyHistory.length < 6) return null;
    const recent3 = monthlyHistory.slice(3).reduce((s, m) => s + m.total, 0) / 3;
    const prior3 = monthlyHistory.slice(0, 3).reduce((s, m) => s + m.total, 0) / 3;
    const delta = recent3 - prior3;
    const isIncreasing = delta > 0;
    return {
      label: `${isIncreasing ? '+' : '−'}${formatCurrency(Math.abs(delta), currency)}/mo over last 3 months`,
      isIncreasing,
    };
  }, [monthlyHistory, currency]);

  const projectedAnnual = useMemo(() => {
    const currentMonthly = monthlyHistory[monthlyHistory.length - 1]?.total ?? 0;
    return currentMonthly * 12;
  }, [monthlyHistory]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.34 }}
      className="relative rounded-[20px] border border-border/40"
    >
      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
      <div className="relative glass-card rounded-[20px] p-5">

        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-[13px] font-bold text-foreground">Spending Trajectory</span>
        </div>

        {/* 6-month bar chart */}
        <div className="h-32 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyHistory} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: number) => [formatCurrency(val, currency), 'Spend']}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                cursor={{ fill: 'rgba(163,230,53,0.06)' }}
              />
              <Bar dataKey="total" radius={[6, 6, 2, 2]} barSize={26}>
                {monthlyHistory.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === monthlyHistory.length - 1
                        ? 'hsl(88 60% 50%)'
                        : 'hsl(88 60% 50% / 0.3)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Velocity pill */}
        {velocityData && (
          <div className={cn(
            'mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold',
            velocityData.isIncreasing
              ? 'bg-destructive/10 text-destructive'
              : 'bg-primary/10 text-primary'
          )}>
            {velocityData.isIncreasing
              ? <ArrowUpRight className="h-3 w-3" />
              : <ArrowDownRight className="h-3 w-3" />
            }
            {velocityData.label}
          </div>
        )}

        {/* Annual projection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              This year
            </p>
            <p className="text-[16px] font-black text-foreground">
              {formatCurrency(projectedAnnual, currency)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">projected</p>
          </div>
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Run rate
            </p>
            <p className="text-[16px] font-black text-foreground">
              {formatCurrency(monthlyHistory[monthlyHistory.length - 1]?.total ?? 0, currency)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">per month</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
