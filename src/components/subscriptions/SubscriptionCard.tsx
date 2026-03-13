import { Subscription } from '@/hooks/useSubscriptions';
import { formatCurrency } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Props {
  subscription: Subscription;
  onClick?: () => void;
}

const statusStyles = {
  active: 'bg-primary/10 text-primary border-0',
  paused: 'bg-warning/10 text-warning border-0',
  cancelled: 'bg-destructive/10 text-destructive border-0',
};

export default function SubscriptionCard({ subscription, onClick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl bg-card p-4 card-shadow cursor-pointer transition-shadow hover:card-shadow-hover"
    >
      {/* Logo */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted overflow-hidden">
        {subscription.logo_url ? (
          <img src={subscription.logo_url} alt={subscription.name} className="h-7 w-7 object-contain" />
        ) : (
          <span className="text-lg font-bold text-primary">{subscription.name[0]}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{subscription.name}</p>
        <p className="text-xs text-muted-foreground">
          {subscription.next_billing_date
            ? `Next: ${format(new Date(subscription.next_billing_date), 'MMM d, yyyy')}`
            : subscription.billing_cycle}
        </p>
      </div>

      {/* Amount & Status */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-base font-bold text-foreground">
          {formatCurrency(subscription.amount, subscription.currency)}
        </span>
        <Badge className={cn('text-[10px] px-2 py-0', statusStyles[subscription.status])}>
          {subscription.status}
        </Badge>
      </div>
    </motion.div>
  );
}
