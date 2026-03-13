import { useState, useMemo } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { formatCurrency } from '@/lib/constants';
import { useProfile } from '@/hooks/useProfile';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';

export default function CalendarPage() {
  const { subscriptions } = useSubscriptions();
  const { profile } = useProfile();
  const currency = profile?.preferred_currency ?? 'EUR';
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const activeSubs = subscriptions.filter(s => s.status === 'active');

  const billingDates = useMemo(() => {
    const dates: Date[] = [];
    activeSubs.forEach(s => {
      if (s.next_billing_date) {
        dates.push(new Date(s.next_billing_date));
      }
    });
    return dates;
  }, [activeSubs]);

  const subsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return activeSubs.filter(s =>
      s.next_billing_date && isSameDay(new Date(s.next_billing_date), selectedDate)
    );
  }, [activeSubs, selectedDate]);

  const modifiers = { billing: billingDates };
  const modifiersStyles = {
    billing: {
      fontWeight: 700,
      position: 'relative' as const,
    },
  };

  return (
    <div className="px-5 pb-24 pt-2">
      <h1 className="mb-5 text-[28px] font-black tracking-tight text-foreground">Calendar</h1>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 rounded-2xl bg-card card-shadow p-3 flex justify-center"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="w-full"
          classNames={{
            day_selected: "gradient-primary text-primary-foreground rounded-lg",
            day_today: "bg-muted text-foreground font-bold rounded-lg",
          }}
        />
      </motion.div>

      {selectedDate && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          {subsForDate.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subscriptions due on this date</p>
          ) : (
            <div className="space-y-2">
              {subsForDate.map(sub => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 rounded-2xl bg-card p-4 card-shadow"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted overflow-hidden">
                    {sub.logo_url ? (
                      <img src={sub.logo_url} alt={sub.name} className="h-6 w-6 object-contain" />
                    ) : (
                      <span className="font-bold text-primary">{sub.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{sub.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{sub.billing_cycle}</p>
                  </div>
                  <span className="font-bold text-foreground">{formatCurrency(sub.amount, currency)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
