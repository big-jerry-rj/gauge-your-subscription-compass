import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { POPULAR_SERVICES, CATEGORIES, calculateNextBillingDate } from '@/lib/constants';
import { useSubscriptions, Subscription } from '@/hooks/useSubscriptions';
import { useProfile } from '@/hooks/useProfile';
import { useSubscriptionMeta, NOTIFICATION_OPTIONS, NotificationReminder } from '@/hooks/useSubscriptionMeta';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function ServiceButton({
  service,
  onSelect,
}: {
  service: typeof POPULAR_SERVICES[number];
  onSelect: (s: typeof POPULAR_SERVICES[number]) => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <button
      onClick={() => onSelect(service)}
      className="flex flex-col items-center gap-2 rounded-2xl bg-muted/50 p-3 transition-all active:scale-95 hover:bg-muted"
    >
      {service.logo && !imgFailed ? (
        <img
          src={service.logo}
          alt={service.name}
          className="h-10 w-10 rounded-xl object-contain"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
          {service.name[0]}
        </div>
      )}
      <span className="text-[10px] font-medium text-foreground leading-tight text-center line-clamp-2">
        {service.name}
      </span>
    </button>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionToEdit?: Subscription | null;
}

export default function AddSubscriptionSheet({ open, onOpenChange, subscriptionToEdit }: Props) {
  const { addSubscription, updateSubscription } = useSubscriptions();
  const { profile } = useProfile();
  const { getMeta, setMeta } = useSubscriptionMeta();
  const isEditMode = !!subscriptionToEdit;

  // Core subscription fields
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<string>('monthly');
  const [category, setCategory] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showLogoPicker, setShowLogoPicker] = useState(true);
  const [loading, setLoading] = useState(false);

  // Extended meta fields
  const [addon, setAddon] = useState('');
  const [freeTrial, setFreeTrial] = useState(false);
  const [notificationReminder, setNotificationReminder] = useState<NotificationReminder>('none');
  const [displayLabel, setDisplayLabel] = useState('');
  const [notes, setNotes] = useState('');

  const currency = profile?.preferred_currency ?? 'EUR';

  // Pre-fill when editing
  useEffect(() => {
    if (subscriptionToEdit) {
      setName(subscriptionToEdit.name);
      setAmount(subscriptionToEdit.amount.toString());
      setBillingCycle(subscriptionToEdit.billing_cycle);
      setCategory(subscriptionToEdit.category ?? '');
      setLogoUrl(subscriptionToEdit.logo_url ?? '');
      setStartDate(subscriptionToEdit.start_date ? new Date(subscriptionToEdit.start_date) : new Date());
      setShowLogoPicker(false);

      const meta = getMeta(subscriptionToEdit.id);
      setAddon(meta.addon ?? '');
      setFreeTrial(meta.free_trial ?? false);
      setNotificationReminder(meta.notification_reminder ?? 'none');
      setDisplayLabel(meta.display_label ?? '');
      setNotes(meta.notes ?? '');
    } else {
      resetForm();
    }
  }, [subscriptionToEdit, open]);

  const selectService = (service: typeof POPULAR_SERVICES[number]) => {
    setName(service.name);
    setLogoUrl(service.logo);
    setCategory(service.category);
    setAmount(service.defaultAmount.toString());
    setShowLogoPicker(false);
  };

  const handleSubmit = async () => {
    if (!name || !amount) return;
    setLoading(true);
    const startStr = format(startDate, 'yyyy-MM-dd');
    const nextBilling = calculateNextBillingDate(startStr, billingCycle);

    if (isEditMode && subscriptionToEdit) {
      await updateSubscription.mutateAsync({
        id: subscriptionToEdit.id,
        name,
        amount: parseFloat(amount),
        billing_cycle: billingCycle as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
        category: category || null,
        start_date: startStr,
        next_billing_date: nextBilling,
        logo_url: logoUrl || null,
      });
      setMeta(subscriptionToEdit.id, { addon, free_trial: freeTrial, notification_reminder: notificationReminder, display_label: displayLabel, notes });
    } else {
      const result = await addSubscription.mutateAsync({
        name,
        amount: parseFloat(amount),
        currency,
        billing_cycle: billingCycle as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
        category: category || null,
        start_date: startStr,
        next_billing_date: nextBilling,
        logo_url: logoUrl || null,
        status: 'active',
      });
      if (result?.id) {
        setMeta(result.id, { addon, free_trial: freeTrial, notification_reminder: notificationReminder, display_label: displayLabel, notes });
      }
    }

    setLoading(false);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName(''); setAmount(''); setBillingCycle('monthly');
    setCategory(''); setLogoUrl(''); setStartDate(new Date());
    setShowLogoPicker(true);
    setAddon(''); setFreeTrial(false); setNotificationReminder('none');
    setDisplayLabel(''); setNotes('');
  };

  const showForm = isEditMode || !showLogoPicker || !!name;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92dvh] flex flex-col rounded-t-[28px] px-0 pb-0 overflow-hidden">
        {/* Sticky header */}
        <SheetHeader className="shrink-0 px-6 pt-5 pb-4 border-b border-border/30">
          <SheetTitle className="text-[22px] font-bold tracking-tight">
            {isEditMode ? 'Edit Subscription' : 'New Subscription'}
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-10 pt-5">
          {!showForm ? (
            /* ── Service picker ── */
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground">Pick a service, or start from scratch</p>
              <div className="grid grid-cols-4 gap-3">
                {POPULAR_SERVICES.map(service => (
                  <ServiceButton key={service.name} service={service} onSelect={selectService} />
                ))}
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full rounded-xl"
                onClick={() => setShowLogoPicker(false)}
              >
                Add manually
              </Button>
            </div>
          ) : (
            /* ── Form ── */
            <div className="space-y-4">
              {/* Selected service header */}
              {logoUrl && !isEditMode && (
                <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
                  <img src={logoUrl} alt={name} className="h-10 w-10 rounded-xl object-contain" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{category}</p>
                  </div>
                  <button
                    onClick={() => resetForm()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Name (only if no logo selected) */}
              {!logoUrl && (
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Netflix, Gym, iCloud"
                    className="rounded-xl"
                  />
                </div>
              )}

              {/* Add-on / plan tier */}
              <div className="space-y-2">
                <Label>Add-on <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  value={addon}
                  onChange={e => setAddon(e.target.value)}
                  placeholder="e.g. Premium, Pro, Family"
                  className="rounded-xl"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label>Amount ({currency})</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="rounded-xl"
                />
              </div>

              {/* Billing Cycle */}
              <div className="space-y-2">
                <Label>Payment cycle</Label>
                <Select value={billingCycle} onValueChange={setBillingCycle}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>First payment</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start rounded-xl text-left font-normal h-11',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={d => d && setStartDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Free trial toggle */}
              <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3.5">
                <Label className="cursor-pointer">Free trial</Label>
                <Switch checked={freeTrial} onCheckedChange={setFreeTrial} />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notifications */}
              <div className="space-y-2">
                <Label>Notifications</Label>
                <Select
                  value={notificationReminder}
                  onValueChange={v => setNotificationReminder(v as NotificationReminder)}
                >
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Display label */}
              <div className="space-y-2">
                <Label>Display label <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  value={displayLabel}
                  onChange={e => setDisplayLabel(e.target.value)}
                  placeholder="e.g. Shared, Work, Personal"
                  className="rounded-xl"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add a note…"
                  className="rounded-xl"
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                disabled={loading || !name || !amount}
                className="h-11 w-full gradient-primary text-primary-foreground font-semibold text-base fab-shadow hover:opacity-90"
              >
                {loading ? 'Saving…' : isEditMode ? 'Save Changes' : 'Save Subscription'}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
