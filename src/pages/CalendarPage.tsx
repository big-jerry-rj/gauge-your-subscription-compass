import { useState, useMemo } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { formatCurrency } from '@/lib/constants';
import { useProfile } from '@/hooks/useProfile';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { GlowingEffect } from '@/components/ui/glowing-effect';

export default function CalendarPage() {
  const { subscriptions } = useSubscriptions();
  const { profile } = useProfile();
  const currency = profile?.preferred_currency ?? 'EUR';
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const activeSubs = subscriptions.filter(s => s.status === 'active');

  const billingDates = useMemo(() => {
    return activeSubs
      .filter(s => s.next_billing_date)
      .map(s => new Date(s.next_billing_date!));
  }, [activeSubs]);

  const subsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return activeSubs.filter(s =>
      s.next_billing_date && isSameDay(new Date(s.next_billing_date), selectedDate)
    );
  }, [activeSubs, selectedDate]);

  const modifiers = { billing: billingDates };
  const modifiersStyles = {
    billing: { fontWeight: 700, position: 'relative' as const },
  };

  return (
    <div className="px-5 pb-28">
      {/* Page header */}
      <div className="pt-8 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/50 mb-1">Gauge</p>
        <h1 className="text-[32px] font-black tracking-tight text-foreground leading-none">Calendar</h1>
      </div>

      <div className="flex justify-center mb-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative inline-block rounded-[20px] border border-border/40"
        >
          <GlowingEffect spread={30} glow={false} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
          <div className="relative rounded-[20px] bg-card p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              classNames={{
                day_selected: 'bg-primary text-primary-foreground rounded-xl',
                day_today: 'bg-muted text-foreground font-bold rounded-xl',
              }}
            />
          </div>
        </motion.div>
      </div>

      {selectedDate && (
        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          {subsForDate.length === 0 ? (
            <p className="text-sm text-muted-foreground">No renewals on this date</p>
          ) : (
            <div className="space-y-3">
              {subsForDate.map(sub => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 rounded-[20px] bg-card border border-border/40 p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted overflow-hidden shrink-0">
                    {sub.logo_url ? (
                      <img src={sub.logo_url} alt={sub.name} className="h-6 w-6 object-contain" />
                    ) : (
                      <span className="font-bold text-primary">{sub.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{sub.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{sub.billing_cycle}</p>
                  </div>
                  <span className="font-bold text-foreground tabular-nums">
                    {formatCurrency(sub.amount, currency)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
