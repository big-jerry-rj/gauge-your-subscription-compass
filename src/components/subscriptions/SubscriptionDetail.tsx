import { Sheet, SheetContent } from '@/components/ui/sheet';
import { AppIcon } from './AppIcon';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Subscription, useSubscriptions } from '@/hooks/useSubscriptions';
import { useSubscriptionMeta, NOTIFICATION_OPTIONS } from '@/hooks/useSubscriptionMeta';
import { formatCurrency, CURRENCIES } from '@/lib/constants';
import { format, differenceInDays } from 'date-fns';
import { Pencil, Trash2, Play, Pause, XCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (sub: Subscription) => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-semibold text-foreground text-right max-w-[56%] truncate">{value}</span>
    </div>
  );
}

function RowDivider() {
  return <div className="h-px bg-border/40 mx-4" />;
}

export default function SubscriptionDetail({ subscription, open, onOpenChange, onEdit }: Props) {
  const { updateSubscription, deleteSubscription } = useSubscriptions();
  const { getMeta } = useSubscriptionMeta();
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!subscription) return null;

  const meta = getMeta(subscription.id);

  const currencyInfo = CURRENCIES.find(c => c.code === subscription.currency);
  const currencyDisplay = `${subscription.currency} · ${currencyInfo?.symbol ?? ''}`;

  const daysUntilRenewal = subscription.next_billing_date
    ? differenceInDays(new Date(subscription.next_billing_date), new Date())
    : null;

  const nextPaymentLabel = subscription.next_billing_date
    ? format(new Date(subscription.next_billing_date), 'EEE d MMM yy')
    : '—';

  const billingCycleLabel =
    subscription.billing_cycle.charAt(0).toUpperCase() + subscription.billing_cycle.slice(1);

  const notifLabel =
    NOTIFICATION_OPTIONS.find(o => o.value === (meta.notification_reminder ?? 'none'))?.label ?? 'None';

  const handleStatusChange = async (status: string) => {
    setLoading(true);
    await updateSubscription.mutateAsync({
      id: subscription.id,
      status: status as 'active' | 'paused' | 'cancelled',
    });
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    await deleteSubscription.mutateAsync(subscription.id);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={o => {
        if (!o) setConfirmDelete(false);
        onOpenChange(o);
      }}
    >
      <SheetContent
        side="bottom"
        className="rounded-t-[28px] px-0 pb-0 overflow-hidden flex flex-col max-h-[88dvh]"
      >
        {/* ── Hero header ── */}
        <div className="flex items-start gap-4 px-6 pt-6 pb-5 shrink-0">
          {/* Logo */}
          <AppIcon
            logoUrl={subscription.logo_url}
            name={subscription.name}
            size={76}
            className="shadow-md"
          />

          {/* Name + plan + price */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="text-[22px] font-black text-foreground leading-tight">
              {subscription.name}
              {meta.addon ? ` ${meta.addon}` : ''}
            </h2>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-[22px] font-black text-primary leading-none">
                {formatCurrency(subscription.amount, subscription.currency)}
              </span>
              <span className="text-[12px] font-semibold text-primary/60">/{subscription.billing_cycle.charAt(0)}</span>
            </div>
            {/* Trial badge */}
            {meta.free_trial && daysUntilRenewal !== null && (
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-[6px] bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                  Trial
                </span>
                <span className="text-[12px] text-muted-foreground">{daysUntilRenewal}d</span>
                <div className="flex-1 h-[3px] rounded-full bg-muted/80 max-w-[48px]">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{ width: `${Math.max(5, Math.min(100, 100 - (daysUntilRenewal / 30) * 100))}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Edit button */}
          <button
            onClick={() => onEdit?.(subscription)}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors shrink-0 mt-1"
          >
            <Pencil className="h-4 w-4 text-foreground/70" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-3">

          {/* Payment info group */}
          <div className="rounded-2xl bg-muted/40 overflow-hidden">
            <InfoRow label="Currency" value={currencyDisplay} />
            <RowDivider />
            <InfoRow label="Payment cycle" value={billingCycleLabel} />
            <RowDivider />
            <InfoRow label="Next payment" value={nextPaymentLabel} />
          </div>

          {/* Category & settings group */}
          <div className="rounded-2xl bg-muted/40 overflow-hidden">
            {subscription.category && (
              <>
                <InfoRow label="Category" value={subscription.category} />
                <RowDivider />
              </>
            )}
            <InfoRow label="Notifications" value={notifLabel} />
            {meta.display_label && (
              <>
                <RowDivider />
                <InfoRow label="Display label" value={meta.display_label} />
              </>
            )}
          </div>

          {/* Notes */}
          {meta.notes && (
            <div className="rounded-2xl bg-muted/40 px-4 py-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Notes
              </p>
              <p className="text-[13px] text-foreground leading-relaxed">{meta.notes}</p>
            </div>
          )}

          {/* Status selector */}
          <div className="rounded-2xl bg-muted/40 px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Status
            </p>
            <Select value={subscription.status} onValueChange={handleStatusChange} disabled={loading}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <span className="flex items-center gap-2">
                    <Play className="h-3 w-3" /> Active
                  </span>
                </SelectItem>
                <SelectItem value="paused">
                  <span className="flex items-center gap-2">
                    <Pause className="h-3 w-3" /> Paused
                  </span>
                </SelectItem>
                <SelectItem value="cancelled">
                  <span className="flex items-center gap-2">
                    <XCircle className="h-3 w-3" /> Cancelled
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Delete */}
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={loading}
            className={cn(
              'w-full h-11 rounded-xl transition-colors',
              confirmDelete
                ? 'border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20'
                : 'border-destructive/30 text-destructive hover:bg-destructive/10'
            )}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {confirmDelete ? 'Tap again to confirm' : 'Remove subscription'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
