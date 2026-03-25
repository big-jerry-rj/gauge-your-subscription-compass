import { useState, useMemo } from 'react';
import { useSubscriptions, Subscription } from '@/hooks/useSubscriptions';
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard';
import SubscriptionDetail from '@/components/subscriptions/SubscriptionDetail';
import { DashboardWidget } from '@/components/subscriptions/DashboardWidget';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const FILTERS = ['All', 'Active', 'Paused', 'Cancelled'] as const;

interface Props {
  onAdd: () => void;
  onEdit: (sub: Subscription) => void;
}

export default function SubscriptionsPage({ onAdd, onEdit }: Props) {
  const { subscriptions, isLoading } = useSubscriptions();
  const [filter, setFilter] = useState<string>('All');
  const [selected, setSelected] = useState<Subscription | null>(null);

  const hasAny = subscriptions.length > 0;
  const activeCount = subscriptions.filter(s => s.status === 'active').length;

  // Read all meta from localStorage once (re-evaluated when subscriptions change)
  const allMeta = useMemo(() => {
    try {
      const raw = localStorage.getItem('gauge-sub-meta');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }, [subscriptions]);

  const filtered = useMemo(() => {
    return subscriptions
      .filter(s => filter === 'All' || s.status === filter.toLowerCase())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [subscriptions, filter]);

  return (
    <div className="px-5 pb-28">
      {/* Page header */}
      <div className="flex items-end justify-between pt-8 pb-4">
        <div>
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
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="shimmer h-[240px] rounded-[24px]" />
          {[1, 2, 3].map(i => (
            <div key={i} className="shimmer h-20 rounded-[20px]" />
          ))}
        </div>
      ) : !hasAny ? (
        <EmptyState onAdd={onAdd} />
      ) : (
        <>
          {/* ── Dashboard widget ── */}
          <DashboardWidget subscriptions={subscriptions} allMeta={allMeta} />

          {/* ── Filter chips ── */}
          <div className="my-5">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200',
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground border border-border/60 hover:bg-muted'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* ── Subscription list ── */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <p className="text-sm text-muted-foreground">
                No results for "{filter}"
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filtered.map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
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
        onEdit={sub => {
          setSelected(null);
          setTimeout(() => onEdit(sub), 280);
        }}
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
      <h2 className="text-[22px] font-black tracking-tight text-foreground mb-3 mt-10">
        No subscriptions yet
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[250px] mb-8">
        You're probably paying for things you've forgotten. Add them here and stay on top of every renewal.
      </p>

      <div className="relative rounded-2xl border border-border/40 mb-9">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
        <button
          onClick={onAdd}
          className="relative inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-[14px] font-bold text-primary-foreground transition-transform active:scale-95"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          Track your first sub
        </button>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/40 mb-3">
        Popular services
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {['Netflix', 'Spotify', 'iCloud', 'YouTube', 'Gym', 'Custom'].map(name => (
          <button
            key={name}
            onClick={onAdd}
            className="rounded-full border border-border/80 bg-muted/70 px-4 py-2 text-[12px] font-semibold text-muted-foreground transition-all active:scale-95 hover:border-primary/30 hover:text-foreground"
          >
            {name}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
