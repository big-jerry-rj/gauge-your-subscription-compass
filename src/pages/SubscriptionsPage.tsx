import { useState, useMemo } from 'react';
import { useSubscriptions, Subscription } from '@/hooks/useSubscriptions';
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard';
import SubscriptionDetail from '@/components/subscriptions/SubscriptionDetail';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const FILTERS = ['All', 'Active', 'Paused', 'Cancelled'] as const;

export default function SubscriptionsPage() {
  const { subscriptions, isLoading } = useSubscriptions();
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Subscription | null>(null);

  const filtered = useMemo(() => {
    return subscriptions.filter(s => {
      const matchesFilter = filter === 'All' || s.status === filter.toLowerCase();
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [subscriptions, filter, search]);

  return (
    <div className="px-5 pb-24 pt-2">
      <h1 className="mb-1 text-[28px] font-black tracking-tight text-foreground">Subscriptions</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        {subscriptions.length} total · {subscriptions.filter(s => s.status === 'active').length} active
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search subscriptions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-10 rounded-xl pl-9 bg-muted/50 border-0"
        />
      </div>

      {/* Filter chips */}
      <div className="mb-5 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              filter === f
                ? "gradient-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <p className="text-lg font-semibold text-foreground">No subscriptions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap + to add your first subscription</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map(sub => (
            <SubscriptionCard key={sub.id} subscription={sub} onClick={() => setSelected(sub)} />
          ))}
        </div>
      )}

      <SubscriptionDetail
        subscription={selected}
        open={!!selected}
        onOpenChange={open => !open && setSelected(null)}
      />
    </div>
  );
}
