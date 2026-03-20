import { Subscription } from '@/hooks/useSubscriptions';
import { formatCurrency } from '@/lib/constants';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface Props {
  subscription: Subscription;
  onClick?: () => void;
}


// Renewal arc — the core Gauge brand motif
function RenewalArc({ nextBillingDate, children }: { nextBillingDate: string | null; children: React.ReactNode }) {
  const daysLeft = nextBillingDate
    ? Math.max(0, differenceInDays(new Date(nextBillingDate), new Date()))
    : null;

  const SIZE = 52;
  const C = SIZE / 2;
  const R = 21;
  const CIRC = 2 * Math.PI * R;

  // Arc depletes as renewal approaches (full = 30+ days away, empty = today)
  const progress = daysLeft !== null ? Math.min(1, daysLeft / 30) : 1;
  const targetOffset = CIRC * (1 - progress);

  const strokeColor =
    daysLeft === null       ? 'hsl(var(--primary) / 0.15)' :
    daysLeft <= 3           ? 'hsl(var(--destructive))' :
    daysLeft <= 7           ? 'hsl(var(--warning))' :
                              'hsl(var(--primary))';

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg className="absolute inset-0" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Track */}
        <circle cx={C} cy={C} r={R} fill="none" stroke="hsl(var(--primary) / 0.07)" strokeWidth="2" />
        {/* Progress arc — animates on mount */}
        {daysLeft !== null && (
          <motion.circle
            cx={C} cy={C} r={R}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: targetOffset }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
            strokeLinecap="round"
            transform={`rotate(-90 ${C} ${C})`}
            opacity={0.8}
          />
        )}
      </svg>
      {/* Logo inner zone */}
      <div
        className="absolute flex items-center justify-center rounded-xl bg-muted overflow-hidden"
        style={{ inset: '5px' }}
      >
        {children}
      </div>
    </div>
  );
}

function daysLeft(date: string | null): number | null {
  if (!date) return null;
  return differenceInDays(new Date(date), new Date());
}

function RenewalLabel({ date, status }: { date: string | null; status: string }) {
  const days = daysLeft(date);

  if (!date) return <span className="text-[12px] text-muted-foreground">No renewal date</span>;
  if (days! < 0) return <span className="text-[12px] text-muted-foreground">Overdue</span>;

  if (days === 0) {
    return (
      <span className="inline-flex items-center rounded-md bg-destructive/15 px-1.5 py-0.5 text-[11px] font-bold text-destructive">
        Renews today
      </span>
    );
  }
  if (days === 1) {
    return (
      <span className="inline-flex items-center rounded-md bg-warning/12 px-1.5 py-0.5 text-[11px] font-bold text-warning">
        Renews tomorrow
      </span>
    );
  }
  if (days! <= 7) {
    return <span className="text-[12px] text-muted-foreground">Renews in {days}d</span>;
  }
  return <span className="text-[12px] text-muted-foreground">Renews {format(new Date(date), 'MMM d')}</span>;
}

function cycleShort(cycle: string): string {
  return cycle === 'monthly' ? '/mo' : cycle === 'yearly' ? '/yr' : cycle === 'weekly' ? '/wk' : '/qtr';
}

export default function SubscriptionCard({ subscription, onClick }: Props) {

  return (
    <motion.div
      whileTap={{ scale: 0.983 }}
      transition={{ duration: 0.12 }}
      onClick={onClick}
      className="relative cursor-pointer rounded-[20px] border border-border/40"
    >
      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
      <div className="relative glass-card flex items-center gap-3.5 px-4 py-3.5 rounded-[20px]">
        {/* Logo tile */}
        <div className="h-[52px] w-[52px] shrink-0 rounded-xl bg-muted overflow-hidden flex items-center justify-center">
          {subscription.logo_url ? (
            <img src={subscription.logo_url} alt={subscription.name} className="h-10 w-10 object-contain rounded-xl" />
          ) : (
            <span className="text-sm font-bold text-primary">{subscription.name[0]}</span>
          )}
        </div>

        {/* Name + renewal date */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] text-foreground truncate leading-snug mb-0.5">
            {subscription.name}
          </p>
          <RenewalLabel date={subscription.next_billing_date} status={subscription.status} />
        </div>

        {/* Amount + cycle */}
        <div className="flex flex-col items-end gap-0.5 shrink-0 mr-2">
          <span className="text-[15px] font-bold text-foreground tabular-nums">
            {formatCurrency(subscription.amount, subscription.currency)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {cycleShort(subscription.billing_cycle)}
          </span>
        </div>

        {/* Lime circle arrow — reference brand motif */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
          <ChevronRight className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
      </div>
    </motion.div>
  );
}
