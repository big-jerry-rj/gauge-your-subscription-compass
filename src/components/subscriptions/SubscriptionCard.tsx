import { Subscription } from '@/hooks/useSubscriptions';
import { formatCurrency } from '@/lib/constants';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { ChevronRight } from 'lucide-react';

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
  const C = SIZE / 2;   // center
  const R = 21;         // radius
  const CIRC = 2 * Math.PI * R;

  // Arc depletes as renewal approaches (full = 30+ days away, empty = today)
  const progress = daysLeft !== null ? Math.min(1, daysLeft / 30) : 1;
  const dashOffset = CIRC * (1 - progress);

  const strokeColor =
    daysLeft === null       ? 'rgba(163,230,53,0.15)' :
    daysLeft <= 3           ? '#ef4444' :
    daysLeft <= 7           ? '#f59e0b' :
                              '#A3E635';

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg className="absolute inset-0" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Track */}
        <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(163,230,53,0.07)" strokeWidth="2" />
        {/* Progress arc */}
        {daysLeft !== null && (
          <circle
            cx={C} cy={C} r={R}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${C} ${C})`}
            opacity={0.8}
          />
        )}
      </svg>
      {/* Logo inner zone */}
      <div
        className="absolute flex items-center justify-center rounded-[11px] bg-muted overflow-hidden"
        style={{ inset: '5px' }}
      >
        {children}
      </div>
    </div>
  );
}

function daysLabel(date: string | null): string {
  if (!date) return 'No renewal date';
  const days = differenceInDays(new Date(date), new Date());
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Renews today';
  if (days === 1) return 'Renews tomorrow';
  if (days <= 7) return `Renews in ${days}d`;
  return `Renews ${format(new Date(date), 'MMM d')}`;
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
      <GlowingEffect spread={30} glow={false} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
      <div className="relative glass-card flex items-center gap-3.5 px-4 py-3.5 rounded-[20px]">
        {/* Renewal arc wrapping the logo */}
        <RenewalArc nextBillingDate={subscription.next_billing_date}>
          {subscription.logo_url ? (
            <img src={subscription.logo_url} alt={subscription.name} className="h-6 w-6 object-contain" />
          ) : (
            <span className="text-sm font-bold text-primary">{subscription.name[0]}</span>
          )}
        </RenewalArc>

        {/* Name + renewal date */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] text-foreground truncate leading-snug">
            {subscription.name}
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {daysLabel(subscription.next_billing_date)}
          </p>
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
