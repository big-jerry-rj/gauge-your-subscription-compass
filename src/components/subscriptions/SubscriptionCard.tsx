import { Subscription } from '@/hooks/useSubscriptions';
import { formatCurrency, getCategoryInfo } from '@/lib/constants';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Props {
  subscription: Subscription;
  onClick?: () => void;
}

const statusConfig = {
  active: { bg: 'bg-green-50', text: 'text-green-600' },
  paused: { bg: 'bg-amber-50', text: 'text-amber-600' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-500' },
};

export default function SubscriptionCard({ subscription, onClick }: Props) {
  const cat = getCategoryInfo(subscription.category);
  const status = statusConfig[subscription.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="flex items-center gap-3 p-4 card-elevated card-elevated-hover cursor-pointer transition-all duration-200"
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
        style={{ backgroundColor: cat.color + '15' }}
      >
        {cat.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#0F172A] dark:text-[#E8E4DC] truncate">{subscription.name}</p>
        <p className="text-xs text-[#64748B] dark:text-[#8A8577]">
          {subscription.next_billing_date
            ? `Next: ${format(new Date(subscription.next_billing_date), 'MMM d, yyyy')}`
            : subscription.billing_cycle}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-base font-bold text-[#0F172A] dark:text-[#E8E4DC]">
          {formatCurrency(subscription.price, subscription.currency)}
        </span>
        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', status.bg, status.text)}>
          {subscription.status}
        </span>
      </div>
    </motion.div>
  );
}
