import { useMemo } from 'react';
import { Subscription } from '@/hooks/useSubscriptions';
import { formatCurrency, getMonthlyAmount } from '@/lib/constants';
import { differenceInDays } from 'date-fns';
import { AlertTriangle, CheckCircle, ChevronRight, Layers, FlaskConical, Clock } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { AppIcon } from '@/components/subscriptions/AppIcon';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  subscriptions: Subscription[];
  currency: string;
  onSelect?: (sub: Subscription) => void;
}

type FlagReason = 'overlap' | 'trial' | 'unreviewed';

interface FlaggedItem {
  sub: Subscription;
  reason: FlagReason;
  detail: string;
  monthlyCost: number;
}

export default function WasteDetectionModule({ subscriptions, currency, onSelect }: Props) {
  const flagged = useMemo<FlaggedItem[]>(() => {
    const active = subscriptions.filter(s => s.status === 'active');
    const items: FlaggedItem[] = [];
    const flaggedIds = new Set<string>();

    // Overlapping categories (2+ subs in same category)
    const categoryGroups: Record<string, Subscription[]> = {};
    active.forEach(s => {
      const cat = s.category || 'Other';
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(s);
    });
    Object.entries(categoryGroups).forEach(([cat, subs]) => {
      if (subs.length >= 2) {
        subs.forEach(s => {
          items.push({
            sub: s,
            reason: 'overlap',
            detail: `Overlaps in ${cat}`,
            monthlyCost: getMonthlyAmount(s.amount, s.billing_cycle),
          });
          flaggedIds.add(s.id);
        });
      }
    });

    // Trials: notes contain "trial" and started within 30 days
    active.forEach(s => {
      if (flaggedIds.has(s.id) || !s.start_date) return;
      const daysSinceStart = differenceInDays(new Date(), new Date(s.start_date));
      const isTrial = s.notes?.toLowerCase().includes('trial') ?? false;
      if (isTrial && daysSinceStart <= 30) {
        const daysLeft = 30 - daysSinceStart;
        items.push({
          sub: s,
          reason: 'trial',
          detail: `Trial ends in ${daysLeft}d`,
          monthlyCost: getMonthlyAmount(s.amount, s.billing_cycle),
        });
        flaggedIds.add(s.id);
      }
    });

    // Unreviewed: not updated in 90+ days, max 3
    active
      .filter(s => !flaggedIds.has(s.id))
      .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
      .filter(s => differenceInDays(new Date(), new Date(s.updated_at)) >= 90)
      .slice(0, 3)
      .forEach(s => {
        const days = differenceInDays(new Date(), new Date(s.updated_at));
        items.push({
          sub: s,
          reason: 'unreviewed',
          detail: `Not reviewed in ${Math.floor(days / 30)}mo`,
          monthlyCost: getMonthlyAmount(s.amount, s.billing_cycle),
        });
      });

    return items;
  }, [subscriptions]);

  const totalSavings = flagged.reduce((sum, f) => sum + f.monthlyCost, 0);

  const ReasonIcon = ({ reason }: { reason: FlagReason }) => {
    if (reason === 'overlap') return <Layers className="h-3 w-3" />;
    if (reason === 'trial') return <FlaskConical className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  const reasonStyle = (reason: FlagReason) => {
    if (reason === 'overlap') return 'text-destructive bg-destructive/10';
    if (reason === 'trial') return 'text-warning bg-warning/10';
    return 'text-muted-foreground bg-muted';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative rounded-[20px] border border-border/40"
    >
      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
      <div className="relative glass-card rounded-[20px] p-5">

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-warning/12">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          </div>
          <span className="text-[13px] font-bold text-foreground">Waste Detection</span>
        </div>

        {flagged.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <p className="text-[13px] font-semibold text-foreground">You're running lean</p>
            <p className="mt-1 text-[12px] text-muted-foreground">No waste detected.</p>
          </div>
        ) : (
          <>
            {/* Potential savings hero */}
            <div className="mb-4 rounded-2xl bg-primary p-4 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/[0.06]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground/60 mb-1">
                You could save up to
              </p>
              <p className="text-[30px] font-black text-primary-foreground leading-none tracking-tight">
                {formatCurrency(totalSavings, currency)}
                <span className="text-[13px] font-semibold ml-1">/mo</span>
              </p>
              <p className="mt-2 text-[11px] text-primary-foreground/70">
                across {flagged.length} flagged subscription{flagged.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-2">
              {flagged.map(({ sub, reason, detail, monthlyCost }) => (
                <button
                  key={`${sub.id}-${reason}`}
                  onClick={() => onSelect?.(sub)}
                  className="w-full flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-3 text-left transition-colors hover:bg-muted/60 active:bg-muted/70"
                >
                  <AppIcon logoUrl={sub.logo_url} name={sub.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{sub.name}</p>
                    <div className={cn(
                      'mt-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold',
                      reasonStyle(reason)
                    )}>
                      <ReasonIcon reason={reason} />
                      {detail}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[12px] font-bold text-foreground tabular-nums">
                      {formatCurrency(monthlyCost, currency)}/mo
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
