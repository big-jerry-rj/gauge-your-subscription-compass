import { useMemo } from 'react';
import { Subscription } from '@/hooks/useSubscriptions';
import { motion } from 'framer-motion';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface Props {
  subscriptions: Subscription[];
}

const SIZE = 168;
const C = SIZE / 2;
const R = 64;
const CIRC = 2 * Math.PI * R;

function ringColor(score: number) {
  if (score >= 70) return '#A3E635';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

function scoreLabel(score: number) {
  if (score >= 70) return 'Healthy';
  if (score >= 40) return 'Fair';
  return 'At Risk';
}

export default function GaugeScoreModule({ subscriptions }: Props) {
  const score = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active');

    // Factor 1: Count (25%)
    const count = active.length;
    const countScore = count <= 5 ? 100 : count <= 10 ? 75 : count <= 15 ? 50 : 25;

    // Factor 2: Overlap (25%)
    const categoryGroups: Record<string, number> = {};
    active.forEach(s => {
      const cat = s.category || 'Other';
      categoryGroups[cat] = (categoryGroups[cat] || 0) + 1;
    });
    const overlapping = Object.values(categoryGroups).filter(c => c >= 2).length;
    const overlapScore = overlapping === 0 ? 100 : overlapping === 1 ? 60 : 30;

    // Factor 3: Budget — no budget in profile, use neutral default
    const budgetScore = 75;

    // Factor 4: Renewal awareness (25%)
    const withRenewal = active.filter(
      s => s.next_billing_date && new Date(s.next_billing_date) > new Date()
    ).length;
    const renewalScore = active.length > 0
      ? Math.round((withRenewal / active.length) * 100)
      : 100;

    const total = Math.round((countScore + overlapScore + budgetScore + renewalScore) / 4);
    return { total, countScore, overlapScore, budgetScore, renewalScore };
  }, [subscriptions]);

  const targetOffset = CIRC * (1 - score.total / 100);
  const color = ringColor(score.total);
  const label = scoreLabel(score.total);

  const factors = [
    { label: 'Count', value: score.countScore },
    { label: 'Overlap', value: score.overlapScore },
    { label: 'Budget', value: score.budgetScore },
    { label: 'Renewals', value: score.renewalScore },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.38 }}
      className="relative rounded-[20px] border border-border/40"
    >
      <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
      <div className="relative glass-card rounded-[20px] p-5">

        <p className="text-[13px] font-bold text-foreground mb-5">Gauge Score</p>

        {/* Ring */}
        <div className="flex flex-col items-center mb-5">
          <div style={{ width: SIZE, height: SIZE }} className="relative">
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
              {/* Track */}
              <circle
                cx={C} cy={C} r={R}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="10"
              />
              {/* Score arc */}
              <motion.circle
                cx={C} cy={C} r={R}
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeDasharray={CIRC}
                initial={{ strokeDashoffset: CIRC }}
                animate={{ strokeDashoffset: targetOffset }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
                strokeLinecap="round"
                transform={`rotate(-90 ${C} ${C})`}
              />
            </svg>
            {/* Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span className="text-[42px] font-black text-foreground leading-none">{score.total}</span>
              <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
            </div>
          </div>
        </div>

        {/* Factor breakdown */}
        <div className="grid grid-cols-4 gap-3">
          {factors.map(f => (
            <div key={f.label} className="flex flex-col items-center gap-1.5">
              <div className="relative w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${f.value}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: 0.5 }}
                />
              </div>
              <span className="text-[11px] font-bold text-foreground">{f.value}</span>
              <span className="text-[9px] text-muted-foreground font-medium leading-none text-center">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
