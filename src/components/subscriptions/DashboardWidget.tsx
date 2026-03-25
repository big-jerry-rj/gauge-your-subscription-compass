import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowUp, ArrowDown, AlertTriangle, CheckCircle2, PauseCircle } from 'lucide-react';
import { Subscription } from '@/hooks/useSubscriptions';
import { SubscriptionMeta } from '@/hooks/useSubscriptionMeta';
import { getMonthlyAmount, getCurrencySymbol } from '@/lib/constants';
import { useProfile } from '@/hooks/useProfile';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useTheme } from '@/hooks/useTheme';
import { AppIcon } from './AppIcon';
import { cn } from '@/lib/utils';

// ── Theme token type ──────────────────────────────────────────────────────────

type W = {
  label: string;
  value: string;
  dim: string;
  sub: string;
  rule: string;
  dot: string;
  ring: string;
  appIconBg: string;
};

const wDark: W = {
  label: 'rgba(255,255,255,0.40)',
  value: 'rgba(255,255,255,0.97)',
  dim:   'rgba(255,255,255,0.50)',
  sub:   'rgba(255,255,255,0.50)',
  rule:  'rgba(255,255,255,0.07)',
  dot:   'rgba(255,255,255,0.20)',
  ring:  'rgba(255,255,255,0.08)',
  appIconBg: 'rgba(255,255,255,0.08)',
};

const wLight: W = {
  label: 'rgba(0,0,0,0.42)',
  value: 'rgba(0,0,0,0.88)',
  dim:   'rgba(0,0,0,0.38)',
  sub:   'rgba(0,0,0,0.42)',
  rule:  'rgba(0,0,0,0.07)',
  dot:   'rgba(0,0,0,0.16)',
  ring:  'rgba(0,0,0,0.08)',
  appIconBg: 'rgba(0,0,0,0.06)',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string | null): number {
  if (!dateStr) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

type Converter = (amount: number, from: string) => number;

function calcMonthly(subs: Subscription[], toPreferred: Converter): number {
  return subs
    .filter(s => s.status === 'active')
    .reduce((acc, s) => acc + getMonthlyAmount(toPreferred(s.amount, s.currency ?? 'EUR'), s.billing_cycle), 0);
}

function calcDelta(subs: Subscription[], toPreferred: Converter): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return subs
    .filter(s => s.status === 'active' && s.start_date && new Date(s.start_date) >= cutoff)
    .reduce((acc, s) => acc + getMonthlyAmount(toPreferred(s.amount, s.currency ?? 'EUR'), s.billing_cycle), 0);
}

function getNextCharge(subs: Subscription[]): Subscription | null {
  const active = subs.filter(s => s.status === 'active' && s.next_billing_date);
  if (!active.length) return null;
  return active.reduce((best, s) =>
    daysUntil(s.next_billing_date) < daysUntil(best.next_billing_date) ? s : best
  );
}

function calcScore(subs: Subscription[], meta: Record<string, SubscriptionMeta>): number {
  if (!subs.length) return 100;
  let score = 100;
  subs.forEach(s => {
    const m = meta[s.id] ?? {};
    if (m.free_trial && s.next_billing_date) {
      const d = daysUntil(s.next_billing_date);
      if (d <= 3) score -= 20;
      else if (d <= 7) score -= 10;
      else if (d <= 14) score -= 4;
    }
    if (s.status === 'paused') score -= 8;
  });
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Returns the estimated monthly spend for each of the past N months (oldest → newest)
function calcMonthlyHistory(subs: Subscription[], toPreferred: Converter, points = 7): number[] {
  const now = new Date();
  return Array.from({ length: points }, (_, i) => {
    const monthOffset = points - 1 - i;
    // Last day of the target month
    const refDate = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0);
    return subs
      .filter(s => s.status === 'active' && s.start_date && new Date(s.start_date) <= refDate)
      .reduce((acc, s) => acc + getMonthlyAmount(toPreferred(s.amount, s.currency ?? 'EUR'), s.billing_cycle), 0);
  });
}

// Generates a smooth SVG cubic-bezier path from normalised 0-100 data points
function generateSmoothPath(points: number[], width: number, height: number): string {
  if (!points || points.length < 2) return `M 0 ${height}`;
  const xStep = width / (points.length - 1);
  const pts = points.map((p, i) => [
    i * xStep,
    height - (p / 100) * (height * 0.8) - height * 0.1,
  ] as [number, number]);
  let path = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const mx = (x1 + x2) / 2;
    path += ` C ${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  }
  return path;
}

function getTrials(subs: Subscription[], meta: Record<string, SubscriptionMeta>) {
  return subs
    .filter(s => s.status === 'active' && meta[s.id]?.free_trial)
    .map(s => ({ sub: s, days: daysUntil(s.next_billing_date) }))
    .sort((a, b) => a.days - b.days);
}

// ── iOS-style type system ─────────────────────────────────────────────────────

function Label({ children, w }: { children: React.ReactNode; w: W }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.07em] mb-1 leading-none" style={{ color: w.label }}>
      {children}
    </p>
  );
}

function VRule({ w }: { w: W }) {
  return <div className="w-px self-stretch mx-1" style={{ background: w.rule }} />;
}

// ── Gauge Score ring ──────────────────────────────────────────────────────────

function ScoreRing({ score, w }: { score: number; w: W }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const ringColor =
    score >= 75 ? 'hsl(74 100% 50%)' :
    score >= 50 ? '#FDB646' :
    '#F76464';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 84, height: 84 }}>
      <svg width={84} height={84} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={42} cy={42} r={r} fill="none" stroke={w.ring} strokeWidth={6} />
        <motion.circle
          cx={42} cy={42} r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.34, 1.06, 0.64, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-black leading-none tabular-nums"
          style={{ fontSize: 20, color: ringColor }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: w.label }}>
          score
        </span>
      </div>
    </div>
  );
}

// ── Page 1: Monthly spend with sparkline ──────────────────────────────────────

const SVG_W = 120;
const SVG_H = 58;

function Page1({
  subs,
  total,
  delta,
  sym,
  toPreferred,
  w,
}: {
  subs: Subscription[];
  total: number;
  delta: number;
  sym: string;
  toPreferred: Converter;
  w: W;
}) {
  const history = useMemo(() => calcMonthlyHistory(subs, toPreferred, 7), [subs, toPreferred]);

  const isIncreasing = delta > 0.5;
  const changePercent = total > 0 && delta > 0.5 ? Math.round((delta / total) * 100) : 0;

  const maxVal = Math.max(...history, 1);
  const normalised = history.map(v => (v / maxVal) * 100);

  const linePath = useMemo(() => generateSmoothPath(normalised, SVG_W, SVG_H), [normalised]);
  const areaPath = useMemo(
    () => (linePath.startsWith('M') ? `${linePath} L ${SVG_W} ${SVG_H} L 0 ${SVG_H} Z` : ''),
    [linePath],
  );

  const strokeColor = isIncreasing ? '#FDB646' : 'hsl(74 100% 50%)';
  const gradId = isIncreasing ? 'sgAmber' : 'sgLime';
  const activeCnt = subs.filter(s => s.status === 'active').length;

  return (
    <div className="flex items-stretch h-full gap-0">
      {/* ── Left: label + change + amount ── */}
      <div className="flex flex-col justify-between pr-4" style={{ width: '54%' }}>
        <Label w={w}>Monthly spend</Label>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            {isIncreasing
              ? <ArrowUp className="h-3 w-3 shrink-0" style={{ color: '#FDB646' }} />
              : <ArrowDown className="h-3 w-3 shrink-0" style={{ color: 'hsl(74 100% 50%)' }} />
            }
            <span className="text-[11px] font-bold" style={{ color: isIncreasing ? '#FDB646' : 'hsl(74 100% 50%)' }}>
              {isIncreasing ? `+${changePercent}% this month` : 'Stable'}
            </span>
          </div>

          <div className="flex items-end leading-none gap-0.5">
            <span className="font-black tracking-tight" style={{ fontSize: 40, color: w.value }}>
              {sym}{Math.floor(total).toLocaleString()}
            </span>
            <span className="font-bold mb-0.5" style={{ fontSize: 18, color: w.dim }}>
              .{String(Math.round((total % 1) * 100)).padStart(2, '0')}
            </span>
          </div>
        </div>

        <p className="text-[11px] font-medium" style={{ color: w.sub }}>
          {activeCnt} active sub{activeCnt !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Right: sparkline chart ── */}
      <div className="flex-1 flex items-center">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          height={SVG_H}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="sgAmber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDB646" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#FDB646" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="sgLime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#CBFF00" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#CBFF00" stopOpacity={0} />
            </linearGradient>
          </defs>
          {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// ── Page 2: Annual spend + Next charge + Gauge Score ──────────────────────────

function Page2({
  subs,
  total,
  score,
  sym,
  next,
  toPreferred,
  w,
}: {
  subs: Subscription[];
  total: number;
  score: number;
  sym: string;
  next: Subscription | null;
  toPreferred: Converter;
  w: W;
}) {
  const annual = total * 12;
  const active = subs.filter(s => s.status === 'active');

  const nextDays = daysUntil(next?.next_billing_date ?? null);
  const nextLabel =
    nextDays <= 0 ? 'Today' :
    nextDays === 1 ? 'Tomorrow' :
    `in ${nextDays}d`;

  const scoreLabel =
    score >= 75 ? 'Healthy' :
    score >= 50 ? 'Review' :
    'At risk';
  const scoreSub =
    score >= 75 ? 'No issues detected' :
    score >= 50 ? 'A few things to check' :
    'Needs attention';

  return (
    <div className="flex items-stretch gap-0 h-full">
      {/* ── Left: annual spend + next charge ── */}
      <div className="flex-1 flex flex-col justify-between pr-4">
        <Label w={w}>Annual spend</Label>

        <div className="flex flex-col">
          <div className="flex items-end leading-none gap-0.5">
            <span className="font-black tracking-tight" style={{ fontSize: 34, color: w.value }}>
              {sym}{Math.floor(annual).toLocaleString()}
            </span>
            <span className="font-bold mb-0.5" style={{ fontSize: 16, color: w.dim }}>
              .{String(Math.round((annual % 1) * 100)).padStart(2, '0')}
            </span>
          </div>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: w.sub }}>per year</p>
        </div>

        {next ? (
          <div className="flex items-center gap-2">
            <AppIcon logoUrl={next.logo_url ?? ''} name={next.name} size={24} bg={w.appIconBg} />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5" style={{ color: w.label }}>Next</p>
              <p className="text-[12px] font-bold leading-none truncate" style={{ color: nextDays <= 1 ? '#F76464' : nextDays <= 3 ? '#FDB646' : w.value }}>
                {next.name} · {nextLabel}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: w.sub }}>{sym}{toPreferred(next.amount, next.currency ?? 'EUR').toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <p className="text-[11px] font-medium" style={{ color: w.sub }}>{active.length} active subs</p>
        )}
      </div>

      <VRule w={w} />

      {/* ── Right: gauge score ── */}
      <div className="flex-1 flex flex-col justify-between pl-4">
        <Label w={w}>Gauge score</Label>

        <div className="flex-1 flex flex-col items-start justify-center">
          <ScoreRing score={score} w={w} />
        </div>

        <div>
          <p
            className="text-[13px] font-bold leading-none"
            style={{ color: score >= 75 ? 'hsl(74 100% 50%)' : score >= 50 ? '#FDB646' : '#F76464' }}
          >
            {scoreLabel}
          </p>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: w.sub }}>{scoreSub}</p>
        </div>
      </div>
    </div>
  );
}

// ── Page 3: Trial tracker ─────────────────────────────────────────────────────

function Page3({ subs, meta, sym, w }: { subs: Subscription[]; meta: Record<string, SubscriptionMeta>; sym: string; w: W }) {
  const trials = useMemo(() => getTrials(subs, meta), [subs, meta]);
  const urgent = trials.filter(t => t.days <= 7);
  const paused = subs.filter(s => s.status === 'paused');

  if (!trials.length && !paused.length) {
    return (
      <div className="flex items-center gap-4 h-full">
        <CheckCircle2 className="h-10 w-10 text-primary shrink-0" />
        <div>
          <p className="text-[17px] font-bold leading-tight" style={{ color: w.value }}>All clear</p>
          <p className="text-[13px] mt-1 leading-snug" style={{ color: w.sub }}>No expiring trials or idle subscriptions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-0">
      <Label w={w}>Alerts</Label>
      <div className="flex-1 flex flex-col justify-center space-y-2.5">
        {urgent.slice(0, 2).map(({ sub, days }) => {
          const c = days <= 3 ? '#F76464' : '#FDB646';
          return (
            <div key={sub.id} className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${c}18` }}>
                <AlertTriangle className="h-4 w-4" style={{ color: c }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate leading-none" style={{ color: w.value }}>{sub.name}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: c }}>
                  Trial {days <= 0 ? 'converts today' : `converts in ${days}d`} · {sym}{sub.amount.toFixed(2)}/mo
                </p>
              </div>
            </div>
          );
        })}
        {paused.slice(0, 2 - Math.min(urgent.length, 2)).map(s => (
          <div key={s.id} className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: w.appIconBg }}>
              <PauseCircle className="h-4 w-4" style={{ color: w.dim }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate leading-none" style={{ color: w.value }}>{s.name}</p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: w.sub }}>Paused · review for waste</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main widget container ─────────────────────────────────────────────────────

const PAGES = 3;
const DRAG_THRESHOLD = 44;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '105%' : '-105%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? '105%' : '-105%', opacity: 0 }),
};

interface Props {
  subscriptions: Subscription[];
  allMeta: Record<string, SubscriptionMeta>;
}

export function DashboardWidget({ subscriptions, allMeta }: Props) {
  const [[page, dir], setPage] = useState<[number, number]>([0, 0]);
  const { profile } = useProfile();
  const { convert } = useExchangeRates();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const w = isDark ? wDark : wLight;
  const preferredCurrency = profile?.preferred_currency ?? 'EUR';
  const sym = getCurrencySymbol(preferredCurrency);

  const toPreferred = useCallback(
    (amount: number, from: string) => convert(amount, from, preferredCurrency),
    [convert, preferredCurrency],
  );

  const total = useMemo(() => calcMonthly(subscriptions, toPreferred), [subscriptions, toPreferred]);
  const delta = useMemo(() => calcDelta(subscriptions, toPreferred), [subscriptions, toPreferred]);
  const next  = useMemo(() => getNextCharge(subscriptions), [subscriptions]);
  const score = useMemo(() => calcScore(subscriptions, allMeta), [subscriptions, allMeta]);

  const paginate = (newDir: number) => {
    setPage(([p]) => [(p + newDir + PAGES) % PAGES, newDir]);
  };

  const handleDragEnd = (_: never, info: PanInfo) => {
    if (info.offset.x < -DRAG_THRESHOLD) paginate(1);
    else if (info.offset.x > DRAG_THRESHOLD) paginate(-1);
  };

  return (
    <div
      className="relative overflow-hidden widget-glass"
      style={{ height: 172, borderRadius: 22 }}
    >
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={page}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 340, damping: 34, mass: 0.9 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'pan-y', padding: '18px 20px 14px' }}
        >
          {page === 0 && (
            <Page1 subs={subscriptions} total={total} delta={delta} sym={sym} toPreferred={toPreferred} w={w} />
          )}
          {page === 1 && (
            <Page2 subs={subscriptions} total={total} score={score} sym={sym} next={next} toPreferred={toPreferred} w={w} />
          )}
          {page === 2 && (
            <Page3 subs={subscriptions} meta={allMeta} sym={sym} w={w} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Page indicator dots */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-[5px]">
        {Array.from({ length: PAGES }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage([i, i > page ? 1 : -1])}
            className="transition-all duration-300"
            style={{
              height: 4,
              width: i === page ? 20 : 4,
              borderRadius: 99,
              background: i === page ? 'hsl(74 100% 50%)' : w.dot,
            }}
          />
        ))}
      </div>
    </div>
  );
}
