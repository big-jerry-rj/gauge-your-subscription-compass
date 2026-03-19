import { Subscription } from '@/hooks/useSubscriptions';
import { formatCurrency } from '@/lib/constants';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface Props {
  subscription: Subscription;
  onClick?: () => void;
}

const statusDot: Record<string, string> = {
  active: 'bg-primary',
  paused: 'bg-warning',
  cancelled: 'bg-destructive',
};

const statusLabel: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  cancelled: 'Cancelled',
};

export default function SubscriptionCard({ subscription, onClick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className="relative cursor-pointer rounded-[20px] border border-border/40"
    >
      <GlowingEffect
        spread={30}
        glow={false}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      {/* Card content sits above the GlowingEffect */}
      <div className="relative glass-card flex items-center gap-3.5 px-4 py-3.5 rounded-[20px]">
        {/* Logo / Avatar */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-muted overflow-hidden">
          {subscription.logo_url ? (
            <img
              src={subscription.logo_url}
              alt={subscription.name}
              className="h-7 w-7 object-contain"
            />
          ) : (
            <span className="text-base font-bold text-primary">
              {subscription.name[0]}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[15px] text-foreground truncate leading-snug">
            {subscription.name}
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {subscription.next_billing_date
              ? `Renews ${format(new Date(subscription.next_billing_date), 'MMM d')}`
              : subscription.billing_cycle}
          </p>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-[15px] font-bold text-foreground tabular-nums">
            {formatCurrency(subscription.amount, subscription.currency)}
          </span>
          <div className="flex items-center gap-1">
            <div className={cn('h-1.5 w-1.5 rounded-full', statusDot[subscription.status])} />
            <span className="text-[11px] font-medium text-muted-foreground">
              {statusLabel[subscription.status]}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
