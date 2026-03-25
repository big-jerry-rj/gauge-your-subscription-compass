import { useState, useEffect, useMemo } from 'react';
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
import { CalendarIcon, ChevronRight, Search, X, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AppIcon } from './AppIcon';
import { searchItunesApps, mapGenreToCategory, ItunesApp } from '@/lib/itunesIcons';
import { motion, AnimatePresence } from 'framer-motion';

const TOP_15 = [
  'Netflix', 'Spotify', 'YouTube Premium', 'Amazon Prime', 'Disney+',
  'Apple Music', 'HBO Max', 'iCloud+', 'Microsoft 365', 'Google One',
  'ChatGPT Plus', 'Adobe Creative Cloud', 'Hulu', 'Dropbox', 'GitHub',
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionToEdit?: Subscription | null;
}

type Step = 'pick' | 'form';

export default function AddSubscriptionSheet({ open, onOpenChange, subscriptionToEdit }: Props) {
  const { addSubscription, updateSubscription } = useSubscriptions();
  const { profile } = useProfile();
  const { getMeta, setMeta } = useSubscriptionMeta();
  const isEditMode = !!subscriptionToEdit;

  const [step, setStep] = useState<Step>(isEditMode ? 'form' : 'pick');
  const [search, setSearch] = useState('');

  // Core fields
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [category, setCategory] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoBg, setLogoBg] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [itunesResults, setItunesResults] = useState<ItunesApp[]>([]);
  const [itunesLoading, setItunesLoading] = useState(false);

  // Meta fields
  const [addon, setAddon] = useState('');
  const [freeTrial, setFreeTrial] = useState(false);
  const [notificationReminder, setNotificationReminder] = useState<NotificationReminder>('none');
  const [displayLabel, setDisplayLabel] = useState('');
  const [notes, setNotes] = useState('');

  const currency = profile?.preferred_currency ?? 'EUR';

  useEffect(() => {
    if (!open) return;
    if (subscriptionToEdit) {
      setStep('form');
      setName(subscriptionToEdit.name);
      setAmount(subscriptionToEdit.amount.toString());
      setBillingCycle(subscriptionToEdit.billing_cycle);
      setCategory(subscriptionToEdit.category ?? '');
      setLogoUrl(subscriptionToEdit.logo_url ?? '');
      setLogoBg('');
      setStartDate(subscriptionToEdit.start_date ? new Date(subscriptionToEdit.start_date) : new Date());
      const meta = getMeta(subscriptionToEdit.id);
      setAddon(meta.addon ?? '');
      setFreeTrial(meta.free_trial ?? false);
      setNotificationReminder(meta.notification_reminder ?? 'none');
      setDisplayLabel(meta.display_label ?? '');
      setNotes(meta.notes ?? '');
    } else {
      setStep('pick');
      resetForm();
    }
  }, [subscriptionToEdit, open]);

  const filteredServices = useMemo(() => {
    if (!search.trim()) return POPULAR_SERVICES;
    const q = search.toLowerCase();
    return POPULAR_SERVICES.filter(s => s.name.toLowerCase().includes(q));
  }, [search]);

  const popularServices = useMemo(
    () => TOP_15.map(n => POPULAR_SERVICES.find(s => s.name === n)).filter(Boolean) as typeof POPULAR_SERVICES[number][],
    []
  );

  const alphabetSections = useMemo(() => {
    const nonPopular = POPULAR_SERVICES.filter(s => !TOP_15.includes(s.name));
    const groups: Record<string, typeof POPULAR_SERVICES[number][]> = {};
    nonPopular.forEach(s => {
      const letter = s.name[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(s);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, []);

  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setItunesResults([]);
      setItunesLoading(false);
      return;
    }
    setItunesLoading(true);
    const timer = setTimeout(async () => {
      const results = await searchItunesApps(search, 6);
      const localNames = new Set(filteredServices.map(s => s.name.toLowerCase()));
      setItunesResults(results.filter(r => !localNames.has(r.trackName.toLowerCase())));
      setItunesLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const selectItunesApp = (app: ItunesApp) => {
    setName(app.trackName);
    setLogoUrl(app.artworkUrl512);
    setLogoBg('#1C1C1E');
    setCategory(mapGenreToCategory(app.primaryGenreName));
    setAmount('');
    setSearch('');
    setItunesResults([]);
    setStep('form');
  };

  const selectService = (service: typeof POPULAR_SERVICES[number]) => {
    setName(service.name);
    setLogoUrl(service.logo);
    setLogoBg(service.bg);
    setCategory(service.category);
    setAmount(service.defaultAmount.toString());
    setSearch('');
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!name || !amount) return;
    setLoading(true);
    const startStr = format(startDate, 'yyyy-MM-dd');
    const nextBilling = calculateNextBillingDate(startStr, billingCycle);
    const metaPayload = { addon, free_trial: freeTrial, notification_reminder: notificationReminder, display_label: displayLabel, notes };

    if (isEditMode && subscriptionToEdit) {
      await updateSubscription.mutateAsync({
        id: subscriptionToEdit.id,
        name, amount: parseFloat(amount),
        billing_cycle: billingCycle as any,
        category: category || null,
        start_date: startStr,
        next_billing_date: nextBilling,
        logo_url: logoUrl || null,
      });
      setMeta(subscriptionToEdit.id, metaPayload);
    } else {
      const result = await addSubscription.mutateAsync({
        name, amount: parseFloat(amount), currency,
        billing_cycle: billingCycle as any,
        category: category || null,
        start_date: startStr,
        next_billing_date: nextBilling,
        logo_url: logoUrl || null,
        status: 'active',
      });
      if (result?.id) setMeta(result.id, metaPayload);
    }

    setLoading(false);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName(''); setAmount(''); setBillingCycle('monthly');
    setCategory(''); setLogoUrl(''); setLogoBg(''); setStartDate(new Date());
    setAddon(''); setFreeTrial(false); setNotificationReminder('none');
    setDisplayLabel(''); setNotes(''); setSearch('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92dvh] flex flex-col rounded-t-[28px] px-0 pb-0 overflow-hidden">
        {/* Header */}
        <SheetHeader className="shrink-0 px-5 pt-5 pb-3 border-b border-border/30">
          <div className="flex items-center gap-3">
            {step === 'form' && !isEditMode && (
              <button
                onClick={() => { setStep('pick'); setName(''); setLogoUrl(''); setLogoBg(''); }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-foreground" />
              </button>
            )}
            <SheetTitle className="text-[20px] font-bold tracking-tight flex-1">
              {isEditMode ? 'Edit Subscription' : step === 'pick' ? 'Add subscription' : name || 'New Subscription'}
            </SheetTitle>
            {step === 'form' && logoUrl && (
              <AppIcon logoUrl={logoUrl} name={name} size={36} bg={logoBg} />
            )}
          </div>
        </SheetHeader>

        <AnimatePresence mode="wait">
          {step === 'pick' ? (
            /* ── Service picker ── */
            <motion.div
              key="pick"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Search */}
              <div className="px-5 pt-4 pb-3 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    placeholder="Search for a brand"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-11 pl-10 rounded-xl bg-muted/60 border-0 focus-visible:ring-1 focus-visible:ring-ring/60"
                    autoComplete="off"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6">
                {search ? (
                  /* ── Search results (flat) ── */
                  <div className="space-y-0.5">
                    {filteredServices.map((service, i) => (
                      <motion.button
                        key={service.name}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.012 }}
                        onClick={() => selectService(service)}
                        className="flex w-full items-center gap-4 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-muted/60 active:bg-muted/80"
                      >
                        <AppIcon logoUrl={service.logo} name={service.name} size={52} bg={service.bg} />
                        <span className="flex-1 text-[15px] font-semibold text-foreground">{service.name}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      </motion.button>
                    ))}

                    {/* App Store results */}
                    {search.length >= 2 && (
                      itunesLoading ? (
                        <div className="flex items-center gap-3 px-2 py-3 text-muted-foreground">
                          <div className="h-5 w-5 shrink-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                          <span className="text-[14px]">Searching App Store…</span>
                        </div>
                      ) : itunesResults.length > 0 ? (
                        <>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-2">
                            From App Store
                          </p>
                          {itunesResults.map(app => (
                            <motion.button
                              key={app.trackName + app.artistName}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => selectItunesApp(app)}
                              className="flex w-full items-center gap-4 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-muted/60 active:bg-muted/80"
                            >
                              <AppIcon logoUrl={app.artworkUrl512} name={app.trackName} size={52} bg="#1C1C1E" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-semibold text-foreground truncate">{app.trackName}</p>
                                <p className="text-[12px] text-muted-foreground truncate">{app.artistName}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                            </motion.button>
                          ))}
                        </>
                      ) : null
                    )}

                    {/* Manual entry */}
                    <button
                      onClick={() => setStep('form')}
                      className="flex w-full items-center gap-4 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-muted/60 mt-2"
                    >
                      <div className="shrink-0 flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 12, background: 'hsl(var(--muted))' }}>
                        <span className="text-[22px] font-black text-muted-foreground">+</span>
                      </div>
                      <span className="flex-1 text-[15px] font-semibold text-foreground">Add manually</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    </button>
                  </div>
                ) : (
                  /* ── Browse mode: Popular + A–Z sections ── */
                  <>
                    {/* Popular */}
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      Popular
                    </p>
                    <div className="space-y-0.5 mb-2">
                      {popularServices.map((service, i) => (
                        <motion.button
                          key={service.name}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.012 }}
                          onClick={() => selectService(service)}
                          className="flex w-full items-center gap-4 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-muted/60 active:bg-muted/80"
                        >
                          <AppIcon logoUrl={service.logo} name={service.name} size={52} bg={service.bg} />
                          <span className="flex-1 text-[15px] font-semibold text-foreground">{service.name}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        </motion.button>
                      ))}
                    </div>

                    {/* A–Z sections */}
                    {alphabetSections.map(([letter, services]) => (
                      <div key={letter}>
                        <p className="text-[11px] font-bold tracking-widest text-muted-foreground mt-5 mb-1 px-1">
                          {letter}
                        </p>
                        <div className="space-y-0.5">
                          {services.map((service, i) => (
                            <motion.button
                              key={service.name}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.008 }}
                              onClick={() => selectService(service)}
                              className="flex w-full items-center gap-4 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-muted/60 active:bg-muted/80"
                            >
                              <AppIcon logoUrl={service.logo} name={service.name} size={52} bg={service.bg} />
                              <span className="flex-1 text-[15px] font-semibold text-foreground">{service.name}</span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Manual entry */}
                    <div className="mt-5">
                      <button
                        onClick={() => setStep('form')}
                        className="flex w-full items-center gap-4 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-muted/60"
                      >
                        <div className="shrink-0 flex items-center justify-center" style={{ width: 52, height: 52, borderRadius: 12, background: 'hsl(var(--muted))' }}>
                          <span className="text-[22px] font-black text-muted-foreground">+</span>
                        </div>
                        <span className="flex-1 text-[15px] font-semibold text-foreground">Add manually</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

          ) : (
            /* ── Form ── */
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.18 }}
              className="flex-1 min-h-0 overflow-y-auto px-5 pb-10 pt-4"
            >
              <div className="space-y-4">
                {/* Name (shown only if no logo/service selected) */}
                {!logoUrl && (
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Netflix, Gym, iCloud"
                      className="rounded-xl"
                      autoFocus
                    />
                  </div>
                )}

                {/* Add-on */}
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
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
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
                        className={cn('w-full justify-start rounded-xl text-left font-normal h-11', !startDate && 'text-muted-foreground')}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={d => d && setStartDate(d)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Free trial */}
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
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notifications */}
                <div className="space-y-2">
                  <Label>Notifications</Label>
                  <Select value={notificationReminder} onValueChange={v => setNotificationReminder(v as NotificationReminder)}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
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
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
