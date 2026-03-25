import { useMemo, useState } from 'react';
import { Subscription } from '@/hooks/useSubscriptions';
import { formatCurrency, getMonthlyAmount } from '@/lib/constants';
import { differenceInMonths, format } from 'date-fns';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { AppIcon } from '@/components/subscriptions/AppIcon';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  subscriptions: Subscription[];
  currency: string;
}

function tenureLabel(months: number): string {
  if (months < 1) return '< 1mo';
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
}

export default function LifecycleInsightsModule({ subscriptions, currency }: Props) {
  const [expanded, setExpanded] = useState(false);

  const data = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active');
    return active
      .map(s => {
        const months = s.start_date
          ? Math.max(1, differenceInMonths(new Date(), new Date(s.start_date)))
          : 1;
        const lifetimeSpend = getMonthlyAmount(s.amount, s.billing_cycle) * months;
        return { sub: s, months, lifetimeSpend };
      })
      .sort((a, b) => b.lifetimeSpend - a.lifetimeSpend);
  }, [subscriptions]);

  const avgLifespan = useMemo(() => {
    const cancelled = subscriptions.filter(s => s.status === 'cancelled' && s.start_date);
    if (cancelled.length === 0) return null;
    const total = cancelled.reduce(
      (sum, s) => sum + Math.max(1, differenceInMonths(new Date(), new Date(s.start_date!))),
      0
    );
    return Math.round(total / cancelled.length);
  }, [subscriptions]);

  if (data.length === 0) return null;

  const [top, ...rest] = data;
  const visibleRest = expanded ? rest : rest.slice(0, 4);
  const hasMore = rest.length > 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.42 }}
      className="relative rounded-[20px] border border-border/40"
    >
      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
      <div className="relative glass-card rounded-[20px] p-5">

        <p className="text-[13px] font-bold text-foreground mb-4">Lifetime Spend</p>

        {/* Top spender — elevated card with lime left accent */}
        <div className="mb-4 rounded-2xl bg-muted/50 overflow-hidden flex">
          <div className="w-[3px] bg-primary shrink-0" />
          <div className="flex items-center gap-3 px-3 py-4 flex-1 min-w-0">
            <AppIcon logoUrl={top.sub.logo_url} name={top.sub.name} size={48} />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-foreground truncate">{top.sub.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {top.sub.start_date
                  ? `Since ${format(new Date(top.sub.start_date), 'MMM yyyy')}`
                  : tenureLabel(top.months)
                }
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[16px] font-black text-foreground tabular-nums">
                {formatCurrency(top.lifetimeSpend, currency)}
              </p>
              <p className="text-[10px] text-muted-foreground">total spent</p>
            </div>
          </div>
        </div>

        {/* Ranked list */}
        {visibleRest.length > 0 && (
          <div className="space-y-3 mb-3">
            {visibleRest.map(({ sub, months, lifetimeSpend }, i) => (
              <div key={sub.id} className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-muted-foreground/50 w-4 shrink-0 tabular-nums">
                  {i + 2}
                </span>
                <AppIcon logoUrl={sub.logo_url} name={sub.name} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{sub.name}</p>
                  <p className="text-[10px] text-muted-foreground">{tenureLabel(months)}</p>
                </div>
                <span className="text-[12px] font-bold text-foreground tabular-nums shrink-0">
                  {formatCurrency(lifetimeSpend, currency)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* See all toggle */}
        {hasMore && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-[11px] font-semibold text-primary mb-4 hover:text-primary/70 transition-colors"
          >
            {expanded
              ? <><ChevronUp className="h-3 w-3" />Show fewer</>
              : <><ChevronDown className="h-3 w-3" />Show {rest.length} more</>
            }
          </button>
        )}

        {/* Average lifespan */}
        <div className="rounded-xl bg-muted/40 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Avg sub lifespan
          </p>
          <p className="text-[15px] font-bold text-foreground">
            {avgLifespan !== null ? `${avgLifespan} months` : 'Cancel one to start tracking'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
