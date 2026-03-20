import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Subscription, useSubscriptions } from '@/hooks/useSubscriptions';
import { formatCurrency } from '@/lib/constants';
import { format } from 'date-fns';
import { Trash2, Pause, Play, XCircle } from 'lucide-react';
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
      <SheetContent side="bottom" className="rounded-t-[28px] px-6 pb-10">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold">Subscription Details</SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted overflow-hidden">
            {subscription.logo_url ? (
              <img src={subscription.logo_url} alt={subscription.name} className="h-9 w-9 object-contain" />
            ) : (
              <span className="text-2xl font-bold text-primary">{subscription.name[0]}</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{subscription.name}</h3>
            <p className="text-sm text-muted-foreground">{subscription.category || 'Uncategorized'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">Amount</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(subscription.amount, subscription.currency)}</p>
            <p className="text-xs text-muted-foreground capitalize">/{subscription.billing_cycle}</p>
          </div>
          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">Next billing</p>
            <p className="text-lg font-bold text-foreground">
              {subscription.next_billing_date ? format(new Date(subscription.next_billing_date), 'MMM d') : '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              {subscription.next_billing_date ? format(new Date(subscription.next_billing_date), 'yyyy') : ''}
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <Select value={subscription.status} onValueChange={handleStatusChange} disabled={loading}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
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
