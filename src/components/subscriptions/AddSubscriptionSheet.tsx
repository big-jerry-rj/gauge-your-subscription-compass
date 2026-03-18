import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { POPULAR_SERVICES, CATEGORIES, BILLING_CYCLES, calculateNextBillingDate } from '@/lib/constants';
import type { BillingCycle, CategoryKey } from '@/lib/constants';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useProfile } from '@/hooks/useProfile';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddSubscriptionSheet({ open, onOpenChange }: Props) {
  const { addSubscription } = useSubscriptions();
  const { profile } = useProfile();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [category, setCategory] = useState<CategoryKey | ''>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState<Date | undefined>(undefined);
  const [cancellationUrl, setCancellationUrl] = useState('');
  const [showPicker, setShowPicker] = useState(true);
  const [loading, setLoading] = useState(false);

  const currency = profile?.preferred_currency ?? 'EUR';

  const selectService = (service: typeof POPULAR_SERVICES[number]) => {
    setName(service.name);
    setCategory(service.category);
    setPrice(service.defaultPrice.toString());
    setShowPicker(false);
  };

  const handleSubmit = async () => {
    if (!name || !price) return;
    setLoading(true);
    const startStr = format(startDate, 'yyyy-MM-dd');
    const nextBilling = calculateNextBillingDate(startStr, billingCycle);
    await addSubscription.mutateAsync({
      name,
      price: parseFloat(price),
      currency,
      billing_cycle: billingCycle,
      category: category || null,
      start_date: startStr,
      next_billing_date: nextBilling,
      status: 'active',
      notes: notes || null,
      is_free_trial: isFreeTrial,
      trial_end_date: trialEndDate ? format(trialEndDate, 'yyyy-MM-dd') : null,
      cancellation_url: cancellationUrl || null,
    });
    setLoading(false);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName(''); setPrice(''); setBillingCycle('monthly');
    setCategory(''); setStartDate(new Date()); setNotes('');
    setIsFreeTrial(false); setTrialEndDate(undefined);
    setCancellationUrl(''); setShowPicker(true);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-3xl px-6 pb-10 bg-white dark:bg-white/10 dark:bg-[#1A1508]">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-extrabold text-[#0F172A] dark:text-[#E8E4DC]">Add Subscription</SheetTitle>
        </SheetHeader>

        {showPicker && !name ? (
          <div>
            <p className="mb-3 text-sm font-medium text-[#64748B] dark:text-[#8A8577]">Choose a service or add custom</p>
            <div className="grid grid-cols-3 gap-3">
              {POPULAR_SERVICES.map(service => {
                const cat = CATEGORIES.find(c => c.key === service.category);
                return (
                  <button
                    key={service.name}
                    onClick={() => selectService(service)}
                    className="flex flex-col items-center gap-1.5 rounded-2xl bg-[#F8FAFC] dark:bg-white dark:bg-white/10/5 p-3 transition-all hover:bg-gray-100 hover:scale-[1.02]"
                  >
                    <span className="text-2xl">{cat?.emoji ?? ''}</span>
                    <span className="text-[11px] font-medium text-[#0F172A] dark:text-[#E8E4DC] leading-tight text-center line-clamp-2">
                      {service.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full rounded-xl border-gray-200"
              onClick={() => setShowPicker(false)}
            >
              Custom subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {name && showPicker === false && (
              <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] dark:bg-white dark:bg-white/10/5 p-3">
                <span className="text-2xl">{CATEGORIES.find(c => c.key === category)?.emoji ?? ''}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[#0F172A] dark:text-[#E8E4DC]">{name}</p>
                  <p className="text-xs text-[#64748B] dark:text-[#8A8577]">{CATEGORIES.find(c => c.key === category)?.label ?? ''}</p>
                </div>
                <button onClick={resetForm} className="text-[#64748B] dark:text-[#8A8577] hover:text-[#0F172A] dark:text-[#E8E4DC]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {!category && (
              <div className="space-y-1.5">
                <Label className="text-[#0F172A] dark:text-[#E8E4DC]">Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Subscription name" className="rounded-xl bg-white dark:bg-white/10" />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-[#0F172A] dark:text-[#E8E4DC]">Price ({currency})</Label>
              <Input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="rounded-xl bg-white dark:bg-white/10" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#0F172A] dark:text-[#E8E4DC]">Billing Cycle</Label>
              <Select value={billingCycle} onValueChange={v => setBillingCycle(v as BillingCycle)}>
                <SelectTrigger className="rounded-xl bg-white dark:bg-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BILLING_CYCLES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#0F172A] dark:text-[#E8E4DC]">Category</Label>
              <Select value={category} onValueChange={v => setCategory(v as CategoryKey)}>
                <SelectTrigger className="rounded-xl bg-white dark:bg-white/10"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.key} value={c.key}>
                      <span className="flex items-center gap-2">{c.emoji} {c.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#0F172A] dark:text-[#E8E4DC]">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start rounded-xl text-left font-normal bg-white dark:bg-white/10", !startDate && "text-[#64748B] dark:text-[#8A8577]")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={d => d && setStartDate(d)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[#0F172A] dark:text-[#E8E4DC]">Notes (optional)</Label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes..." className="rounded-xl bg-white dark:bg-white/10" />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] dark:bg-white dark:bg-white/10/5 p-3">
              <Label className="text-sm text-[#0F172A] dark:text-[#E8E4DC]">Free trial?</Label>
              <Switch checked={isFreeTrial} onCheckedChange={setIsFreeTrial} />
            </div>

            {isFreeTrial && (
              <div className="space-y-1.5">
                <Label className="text-[#0F172A] dark:text-[#E8E4DC]">Trial End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start rounded-xl text-left font-normal bg-white dark:bg-white/10", !trialEndDate && "text-[#64748B] dark:text-[#8A8577]")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {trialEndDate ? format(trialEndDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={trialEndDate} onSelect={setTrialEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-[#0F172A] dark:text-[#E8E4DC]">Cancellation URL (optional)</Label>
              <Input value={cancellationUrl} onChange={e => setCancellationUrl(e.target.value)} placeholder="https://..." className="rounded-xl bg-white dark:bg-white/10" />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !name || !price}
              className="h-12 w-full rounded-xl gradient-green text-white font-semibold text-base fab-shadow hover:opacity-90"
            >
              {loading ? 'Adding...' : 'Add Subscription'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
