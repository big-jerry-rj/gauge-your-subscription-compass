import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { POPULAR_SERVICES, CATEGORIES, calculateNextBillingDate } from '@/lib/constants';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useProfile } from '@/hooks/useProfile';
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
}

export default function AddSubscriptionSheet({ open, onOpenChange }: Props) {
  const { addSubscription } = useSubscriptions();
  const { profile } = useProfile();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<string>('monthly');
  const [category, setCategory] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showLogoPicker, setShowLogoPicker] = useState(true);
  const [loading, setLoading] = useState(false);

  const currency = profile?.preferred_currency ?? 'EUR';

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
    await addSubscription.mutateAsync({
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
    setLoading(false);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName(''); setAmount(''); setBillingCycle('monthly');
    setCategory(''); setLogoUrl(''); setStartDate(new Date());
    setShowLogoPicker(true);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92vh] overflow-y-auto rounded-t-[28px] px-6 pb-10">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-[22px] font-bold tracking-tight">Add Subscription</SheetTitle>
        </SheetHeader>

        {showLogoPicker && !name ? (
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">Choose a service or add custom</p>
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
              Custom subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {logoUrl && (
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
                <img src={logoUrl} alt={name} className="h-10 w-10 rounded-xl object-contain" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{category}</p>
                </div>
                <button onClick={() => { resetForm(); }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {!logoUrl && (
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Subscription name" className="rounded-xl" />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Amount ({currency})</Label>
              <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="rounded-xl" />
            </div>

            <div className="space-y-1.5">
              <Label>Billing Cycle</Label>
              <Select value={billingCycle} onValueChange={setBillingCycle}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start rounded-xl text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={d => d && setStartDate(d)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !name || !amount}
              className="h-12 w-full rounded-xl gradient-primary text-primary-foreground font-semibold text-base fab-shadow hover:opacity-90"
            >
              {loading ? 'Adding...' : 'Add Subscription'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
