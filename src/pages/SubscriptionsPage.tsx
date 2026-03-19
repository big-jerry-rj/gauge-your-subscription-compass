import { useState, useMemo } from 'react';
import { useSubscriptions, Subscription } from '@/hooks/useSubscriptions';
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard';
import SubscriptionDetail from '@/components/subscriptions/SubscriptionDetail';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const FILTERS = ['All', 'Active', 'Paused', 'Cancelled'] as const;

interface Props {
  onAdd: () => void;
}

export default function SubscriptionsPage({ onAdd }: Props) {
  const { subscriptions, isLoading } = useSubscriptions();
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Subscription | null>(null);

  const hasAny = subscriptions.length > 0;
  const activeCount = subscriptions.filter(s => s.status === 'active').length;

  const filtered = useMemo(() => {
    return subscriptions.filter(s => {
      const matchesFilter = filter === 'All' || s.status === filter.toLowerCase();
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [subscriptions, filter, search]);

  return (
    <div className="px-5 pb-28">
      {/* Page header */}
      <div className="flex items-end justify-between pt-8 pb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/50 mb-1">Gauge</p>
          <h1 className="text-[32px] font-black tracking-tight leading-none">
            <span className="text-foreground">Your </span>
            <span className="text-primary">subs</span>
          </h1>
          {hasAny && (
            <p className="mt-2 text-sm text-muted-foreground">
              {subscriptions.length} total · {activeCount} active
            </p>
          )}
        </div>
        {hasAny && (
          <button className="flex h-9 w-9 items-center justify-center rounded-2xl bg-muted/60 transition-colors active:bg-muted">
            <SlidersHorizontal className="h-[17px] w-[17px] text-muted-foreground" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 animate-pulse rounded-[20px] bg-muted/60" />
          ))}
        </div>
      ) : !hasAny ? (
        <EmptyState onAdd={onAdd} />
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground/50" />
            <Input
              placeholder="Search subscriptions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-11 rounded-2xl pl-10 bg-muted/50 border-0 text-[14px] font-medium placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-primary/25"
            />
          </div>

          {/* Filter chips */}
          <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200',
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <p className="text-sm text-muted-foreground">
                No results for "{search || filter}"
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filtered.map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <SubscriptionCard subscription={sub} onClick={() => setSelected(sub)} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      <SubscriptionDetail
        subscription={selected}
        open={!!selected}
        onOpenChange={open => !open && setSelected(null)}
      />
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center pt-6 pb-4 text-center"
    >
      <h2 className="text-[22px] font-black tracking-tight text-foreground mb-2.5 mt-10">
        No subscriptions yet
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[250px] mb-8">
        Add your first recurring payment to start tracking renewals and monthly spend.
      </p>

      {/* Primary CTA */}
      <button
        onClick={onAdd}
        className="mb-9 flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-[14px] font-bold text-primary-foreground transition-transform active:scale-95"
        style={{ boxShadow: '0 4px 20px rgba(133,203,51,0.35)' }}
      >
        <span className="text-lg leading-none font-light">+</span>
        Add your first subscription
      </button>

      {/* Suggestions */}
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/40 mb-3">
        Popular services
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {['Netflix', 'Spotify', 'iCloud', 'YouTube', 'Gym', 'Custom'].map(name => (
          <button
            key={name}
            onClick={onAdd}
            className="rounded-full border border-border/50 bg-card/40 px-4 py-1.5 text-[12px] font-semibold text-muted-foreground transition-all active:scale-95 hover:border-primary/30 hover:text-foreground"
          >
            {name}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
