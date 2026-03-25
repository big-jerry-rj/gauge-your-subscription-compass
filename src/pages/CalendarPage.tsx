import { useState, useMemo, useRef, useEffect } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { formatCurrency } from '@/lib/constants';
import { useProfile } from '@/hooks/useProfile';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { AppIcon } from '@/components/subscriptions/AppIcon';
import { format, isSameDay, differenceInCalendarDays, addDays, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, CheckCircle2, CalendarX } from 'lucide-react';
import { cn } from '@/lib/utils';

const TODAY = startOfDay(new Date());
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STRIP_DAYS = 30;

function dueLabel(billingDate: Date): string {
  const diff = differenceInCalendarDays(billingDate, TODAY);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
}

function cycleLabel(cycle: string): string {
  const map: Record<string, string> = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Annual',
  };
  return map[cycle] ?? cycle;
}

export default function CalendarPage() {
  const { subscriptions } = useSubscriptions();
  const { profile } = useProfile();
  const { rates, convert } = useExchangeRates();
  const currency = profile?.preferred_currency ?? 'EUR';

  const [selectedDate, setSelectedDate] = useState<Date>(TODAY);
  const todayRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Scroll today into view on mount
  useEffect(() => {
    if (todayRef.current && stripRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, []);

  const activeSubs = useMemo(
    () => subscriptions.filter(s => s.status === 'active' && s.next_billing_date),
    [subscriptions]
  );

  // Dates in the strip
  const stripDates = useMemo(
    () => Array.from({ length: STRIP_DAYS }, (_, i) => addDays(TODAY, i)),
    []
  );

  // Which dates in the strip have a billing event
  const billingDateSet = useMemo(() => {
    const set = new Set<string>();
    activeSubs.forEach(s => {
      if (s.next_billing_date) set.add(format(new Date(s.next_billing_date), 'yyyy-MM-dd'));
    });
    return set;
  }, [activeSubs]);

  // Bento: pending this week
  const pendingThisWeek = useMemo(() => {
    const end = addDays(TODAY, 7);
    return activeSubs
      .filter(s => {
        const d = new Date(s.next_billing_date!);
        return d >= TODAY && d <= end;
      })
      .reduce((sum, s) => sum + convert(s.amount, s.currency ?? 'EUR', currency, rates), 0);
  }, [activeSubs, currency, rates, convert]);

  // Bento: renewals this month
  const renewalsThisMonth = useMemo(() => {
    const monthEnd = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0);
    return activeSubs.filter(s => {
      const d = new Date(s.next_billing_date!);
      return d >= TODAY && d <= monthEnd;
    }).length;
  }, [activeSubs]);

  // Agenda: filter by selectedDate if not today; else show next 30 days
  const isToday = isSameDay(selectedDate, TODAY);
  const agendaSubs = useMemo(() => {
    let subs = activeSubs
      .filter(s => {
        const d = new Date(s.next_billing_date!);
        if (isToday) {
          return d >= TODAY && d <= addDays(TODAY, STRIP_DAYS);
        }
        return isSameDay(d, selectedDate);
      })
      .sort((a, b) => new Date(a.next_billing_date!).getTime() - new Date(b.next_billing_date!).getTime());
    return subs;
  }, [activeSubs, selectedDate, isToday]);

  const agendaLabel = isToday ? 'Upcoming' : `${format(selectedDate, 'MMMM d')}`;

  return (
    <div className="pb-28">
      {/* ── Editorial Header ── */}
      <div className="px-5 pt-8 pb-5">
        <p className="text-primary font-bold tracking-widest text-[10px] uppercase mb-1">
          Payment Tracking
        </p>
        <h1 className="text-[34px] font-black tracking-tight leading-none text-foreground">
          Payment<br />Calendar
        </h1>
      </div>

      {/* ── Horizontal Date Strip ── */}
      <div className="mb-5">
        <div className="flex items-center justify-between px-5 mb-3">
          <h3 className="text-base font-bold tracking-tight text-foreground">
            {format(selectedDate, 'MMMM yyyy')}
          </h3>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(TODAY)}
              className="text-primary text-xs font-bold active:scale-95 transition-transform"
            >
              Today
            </button>
          )}
        </div>

        <div
          ref={stripRef}
          className="flex gap-3 overflow-x-auto no-scrollbar py-1 px-5"
        >
          {stripDates.map((date, i) => {
            const isSelected = isSameDay(date, selectedDate);
            const isT = isSameDay(date, TODAY);
            const hasBilling = billingDateSet.has(format(date, 'yyyy-MM-dd'));

            return (
              <button
                key={i}
                ref={isT ? todayRef : undefined}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'flex-shrink-0 w-14 h-20 rounded-2xl flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all duration-150',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-card text-foreground'
                )}
              >
                <span className={cn(
                  'text-[10px] font-bold uppercase',
                  isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                )}>
                  {DAYS_SHORT[date.getDay()]}
                </span>
                <span className="text-lg font-extrabold leading-none">
                  {format(date, 'd')}
                </span>
                {/* Billing dot */}
                <div className={cn(
                  'w-1 h-1 rounded-full mt-0.5',
                  hasBilling
                    ? isSelected ? 'bg-primary-foreground' : 'bg-primary'
                    : 'bg-transparent'
                )} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bento Highlights ── */}
      <div className="px-5 mb-6 grid grid-cols-2 gap-4">
        {/* Pending this week */}
        <div className="p-5 rounded-2xl bg-primary flex flex-col justify-between aspect-square">
          <CalendarClock className="w-6 h-6 text-primary-foreground/80" strokeWidth={2} />
          <div>
            <h4 className="text-primary-foreground font-black text-2xl tracking-tight leading-none">
              {formatCurrency(pendingThisWeek, currency)}
            </h4>
            <p className="text-primary-foreground/70 text-xs font-medium mt-1">Pending this week</p>
          </div>
        </div>

        {/* Renewals this month */}
        <div className="p-5 rounded-2xl bg-card flex flex-col justify-between aspect-square border border-border/40">
          <CheckCircle2 className="w-6 h-6 text-primary" strokeWidth={2} />
          <div>
            <h4 className="text-foreground font-black text-2xl tracking-tight leading-none">
              {renewalsThisMonth}
            </h4>
            <p className="text-muted-foreground text-xs font-medium mt-1">Renewals this month</p>
          </div>
        </div>
      </div>

      {/* ── Upcoming Agenda ── */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold tracking-tight text-foreground">{agendaLabel}</h3>
          {isToday && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Next 30 days
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {agendaSubs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-12 text-center"
            >
              <CalendarX className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">
                {isToday ? 'No upcoming renewals' : 'Nothing renewing on this day'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedDate.toISOString()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {agendaSubs.map((sub, i) => {
                const billingDate = new Date(sub.next_billing_date!);
                const amount = convert(sub.amount, sub.currency ?? 'EUR', currency, rates);

                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.18, ease: 'easeOut' }}
                    className="p-4 rounded-2xl bg-card border border-border/40 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    {/* Icon — circular crop */}
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-muted">
                      <AppIcon logoUrl={sub.logo_url} name={sub.name} size={48} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{sub.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {dueLabel(billingDate)}
                        <span className="text-muted-foreground/50 mx-1">·</span>
                        {format(billingDate, 'MMM d')}
                      </p>
                    </div>

                    {/* Amount + cycle */}
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-foreground tabular-nums">
                        {formatCurrency(amount, currency)}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
                        {cycleLabel(sub.billing_cycle)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer aesthetic card ── */}
      <div className="px-5 mt-8 mb-2">
        <div className="rounded-2xl bg-card border border-border/40 p-6 flex items-start gap-4">
          <div className="w-1 h-full min-h-[48px] rounded-full bg-primary shrink-0" />
          <div>
            <h4 className="font-extrabold text-lg tracking-tight text-foreground leading-tight">
              Financial Wellness
            </h4>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              Track your spending without linking bank accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
