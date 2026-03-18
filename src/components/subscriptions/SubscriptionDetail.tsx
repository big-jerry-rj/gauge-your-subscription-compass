import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Subscription, useSubscriptions } from '@/hooks/useSubscriptions';
import { formatCurrency, getCategoryInfo, getMonthlyAmount } from '@/lib/constants';
import { format } from 'date-fns';
import { Trash2, Pause, Play, XCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface Props {
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionDetail({ subscription, open, onOpenChange }: Props) {
  const { updateSubscription, deleteSubscription } = useSubscriptions();
  const [loading, setLoading] = useState(false);

  if (!subscription) return null;

  const cat = getCategoryInfo(subscription.category);
  const monthly = getMonthlyAmount(subscription.price, subscription.billing_cycle);

  const handleStatusChange = async (status: string) => {
    setLoading(true);
    await updateSubscription.mutateAsync({
      id: subscription.id,
      status: status as 'active' | 'paused' | 'cancelled',
    });
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await deleteSubscription.mutateAsync(subscription.id);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl px-6 pb-10 bg-white dark:bg-[#1A1508]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-[#0F172A] dark:text-[#E8E4DC]">Subscription Details</SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-4 mb-6">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
            style={{ backgroundColor: cat.color + '15' }}
          >
            {cat.emoji}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#E8E4DC]">{subscription.name}</h3>
            <p className="text-sm text-[#64748B] dark:text-[#8A8577]">{cat.label}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl bg-[#F8FAFC] dark:bg-white/5 p-4">
            <p className="text-xs text-[#64748B] dark:text-[#8A8577] mb-1">Amount</p>
            <p className="text-2xl font-bold text-[#0F172A] dark:text-[#E8E4DC]">{formatCurrency(subscription.price, subscription.currency)}</p>
            <p className="text-xs text-[#64748B] dark:text-[#8A8577] capitalize">/{subscription.billing_cycle}</p>
          </div>
          <div className="rounded-2xl bg-[#F8FAFC] dark:bg-white/5 p-4">
            <p className="text-xs text-[#64748B] dark:text-[#8A8577] mb-1">Monthly cost</p>
            <p className="text-2xl font-bold text-[#0F172A] dark:text-[#E8E4DC]">{formatCurrency(monthly, subscription.currency)}</p>
            <p className="text-xs text-[#64748B] dark:text-[#8A8577]">
              {subscription.next_billing_date ? `Next: ${format(new Date(subscription.next_billing_date), 'MMM d')}` : ''}
            </p>
          </div>
        </div>

        {subscription.is_free_trial && subscription.trial_end_date && (
          <div className="mb-4 rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-600">Free Trial</p>
            <p className="text-sm text-blue-700">Ends {format(new Date(subscription.trial_end_date), 'MMM d, yyyy')}</p>
          </div>
        )}

        {subscription.notes && (
          <div className="mb-4 rounded-2xl bg-[#F8FAFC] dark:bg-white/5 p-4">
            <p className="text-xs text-[#64748B] dark:text-[#8A8577] mb-1">Notes</p>
            <p className="text-sm text-[#0F172A] dark:text-[#E8E4DC]">{subscription.notes}</p>
          </div>
        )}

        {subscription.cancellation_url && (
          <a
            href={subscription.cancellation_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 flex items-center gap-2 text-sm text-[#22C55E] font-medium"
          >
            <ExternalLink className="h-4 w-4" /> Cancellation link
          </a>
        )}

        <div className="mb-6 space-y-1.5">
          <p className="text-xs font-medium text-[#64748B] dark:text-[#8A8577]">Status</p>
          <Select value={subscription.status} onValueChange={handleStatusChange} disabled={loading}>
            <SelectTrigger className="rounded-xl bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active"><span className="flex items-center gap-2"><Play className="h-3 w-3" /> Active</span></SelectItem>
              <SelectItem value="paused"><span className="flex items-center gap-2"><Pause className="h-3 w-3" /> Paused</span></SelectItem>
              <SelectItem value="cancelled"><span className="flex items-center gap-2"><XCircle className="h-3 w-3" /> Cancelled</span></SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
          className="w-full rounded-xl h-11"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Subscription
        </Button>
      </SheetContent>
    </Sheet>
  );
}
