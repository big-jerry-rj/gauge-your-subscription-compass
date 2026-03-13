import { useState, useMemo } from 'react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { formatCurrency, getCategoryInfo } from '@/lib/constants';
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
      fontWeight: 700 as const,
      position: 'relative' as const,
    },
  };

  return (
    <div className="px-5 pb-24 pt-12">
      <h1 className="mb-5 text-[32px] font-black tracking-tight text-[#0F172A]">Calendar</h1>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 rounded-[20px] card-elevated p-3 flex justify-center"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          className="w-full"
          classNames={{
            day_selected: "gradient-green text-white rounded-lg",
            day_today: "bg-gray-100 text-[#0F172A] font-bold rounded-lg",
          }}
        />
      </motion.div>

      {selectedDate && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#64748B]">
            {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          {subsForDate.length === 0 ? (
            <p className="text-sm text-[#64748B]">No subscriptions due on this date</p>
          ) : (
            <div className="space-y-2">
              {subsForDate.map(sub => {
                const cat = getCategoryInfo(sub.category);
                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 rounded-[16px] card-elevated p-4"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                      style={{ backgroundColor: cat.color + '15' }}
                    >
                      {cat.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-[#0F172A]">{sub.name}</p>
                      <p className="text-xs text-[#64748B] capitalize">{sub.billing_cycle}</p>
                    </div>
                    <span className="font-bold text-[#0F172A]">{formatCurrency(sub.price, currency)}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
