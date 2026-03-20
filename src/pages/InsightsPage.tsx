import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useSubscriptions, Subscription } from '@/hooks/useSubscriptions';
import { useProfile } from '@/hooks/useProfile';
import { formatCurrency, getMonthlyAmount } from '@/lib/constants';
import { motion, animate, Reorder } from 'framer-motion';
import { TrendingUp, ArrowUpRight, AlertCircle, GripVertical } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { format, differenceInDays, subMonths, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import SubscriptionDetail from '@/components/subscriptions/SubscriptionDetail';
import WasteDetectionModule from '@/components/insights/WasteDetectionModule';
import GaugeScoreModule from '@/components/insights/GaugeScoreModule';
import LifecycleInsightsModule from '@/components/insights/LifecycleInsightsModule';

const CHART_COLORS = [
  'hsl(88 60% 50%)', 'hsl(167 24% 52%)', 'hsl(199 89% 48%)',
  'hsl(262 52% 47%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)',
  'hsl(45 31% 42%)', 'hsl(320 60% 52%)',
];

type TileId = 'quick-stats' | 'renewals' | 'category' | 'gauge-score' | 'waste' | 'lifecycle';
const DEFAULT_ORDER: TileId[] = ['quick-stats', 'renewals', 'category', 'gauge-score', 'waste', 'lifecycle'];

export default function InsightsPage() {
  const { subscriptions } = useSubscriptions();
  const { profile } = useProfile();
  const currency = profile?.preferred_currency ?? 'EUR';
  const [selected, setSelected] = useState<Subscription | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [tileOrder, setTileOrder] = useState<TileId[]>(() => {
    try {
      const saved = localStorage.getItem('gauge-insights-order');
      if (saved) {
        const parsed: TileId[] = JSON.parse(saved);
        // Ensure all default tiles are present (handles new tile additions)
        const valid = DEFAULT_ORDER.every(id => parsed.includes(id));
        if (valid && parsed.length === DEFAULT_ORDER.length) return parsed;
      }
    } catch {}
    return [...DEFAULT_ORDER];
  });

  useEffect(() => {
    localStorage.setItem('gauge-insights-order', JSON.stringify(tileOrder));
  }, [tileOrder]);

  // Long-press detection (iPhone widget style)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerOrigin = useRef<{ x: number; y: number } | null>(null);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    pointerOrigin.current = null;
  }, []);

  const startLongPress = useCallback((e: React.PointerEvent) => {
    if (editMode) return; // already in edit mode
    pointerOrigin.current = { x: e.clientX, y: e.clientY };
    longPressTimer.current = setTimeout(() => {
      setEditMode(true);
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        (navigator as Navigator & { vibrate: (ms: number) => void }).vibrate(30);
      }
      longPressTimer.current = null;
    }, 500);
  }, [editMode]);

  const checkLongPressMove = useCallback((e: React.PointerEvent) => {
    if (!longPressTimer.current || !pointerOrigin.current) return;
    const dx = e.clientX - pointerOrigin.current.x;
    const dy = e.clientY - pointerOrigin.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) cancelLongPress();
  }, [cancelLongPress]);

  // Core data
  const active = subscriptions.filter(s => s.status === 'active');
  const paused = subscriptions.filter(s => s.status === 'paused');

  const monthlyTotal = useMemo(
    () => active.reduce((sum, s) => sum + getMonthlyAmount(s.amount, s.billing_cycle), 0),
    [active]
  );
  const yearlyTotal = monthlyTotal * 12;
  const pausedSavings = paused.reduce((sum, s) => sum + getMonthlyAmount(s.amount, s.billing_cycle), 0);

  // Animated counter
  const [displayTotal, setDisplayTotal] = useState(0);
  useEffect(() => {
    const controls = animate(0, monthlyTotal, {
      duration: 1.0,
      ease: [0.25, 0.1, 0.25, 1],
      onUpdate: v => setDisplayTotal(v),
    });
    return () => controls.stop();
  }, [monthlyTotal]);

  const upcomingRenewals = useMemo(() =>
    active
      .filter(s => {
        if (!s.next_billing_date) return false;
        const days = differenceInDays(new Date(s.next_billing_date), new Date());
        return days >= 0 && days <= 7;
      })
      .sort((a, b) => new Date(a.next_billing_date!).getTime() - new Date(b.next_billing_date!).getTime()),
    [active]
  );
  const upcomingTotal = upcomingRenewals.reduce((sum, s) => sum + s.amount, 0);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach(s => {
      const cat = s.category || 'Other';
      map[cat] = (map[cat] || 0) + getMonthlyAmount(s.amount, s.billing_cycle);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [active]);

  // 6-month history for the combined hero chart
  const monthlyHistory = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthEnd = endOfMonth(date);
      const total = subscriptions
        .filter(s => s.status === 'active')
        .filter(s => s.start_date && new Date(s.start_date) <= monthEnd)
        .reduce((sum, s) => sum + getMonthlyAmount(s.amount, s.billing_cycle), 0);
      months.push({ month: format(date, 'MMM'), total: Math.round(total * 100) / 100 });
    }
    return months;
  }, [subscriptions]);

  // ── Interactive hero chart (must come after monthlyHistory) ─────────────────
  const SVG_W = 400;
  const SVG_H = 130;
  const [activeIdx, setActiveIdx] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const chartSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setActiveIdx(Math.max(0, monthlyHistory.length - 1));
  }, [monthlyHistory.length]);

  const chartPoints = useMemo(() => {
    if (monthlyHistory.length === 0) return [];
    const vals = monthlyHistory.map(m => m.total);
    const maxV = Math.max(...vals, 0.01);
    const range = maxV;
    const PAD_T = 14, PAD_B = 10;
    return monthlyHistory.map((m, i) => ({
      x: monthlyHistory.length === 1
        ? SVG_W / 2
        : (i / (monthlyHistory.length - 1)) * SVG_W,
      y: PAD_T + (range > 0 ? (1 - m.total / range) : 0.5) * (SVG_H - PAD_T - PAD_B),
      total: m.total,
      month: m.month,
    }));
  }, [monthlyHistory]);

  const linePath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = chartPoints.length ? `${linePath} L${SVG_W},${SVG_H} L0,${SVG_H} Z` : '';

  const safeIdx = Math.min(Math.max(0, activeIdx), Math.max(0, chartPoints.length - 1));
  const activePoint = chartPoints[safeIdx] ?? null;
  const currentPoint = chartPoints[chartPoints.length - 1] ?? null;
  const scrubDelta = activePoint && currentPoint ? activePoint.total - currentPoint.total : 0;
  const scrubPct = currentPoint?.total > 0 ? (scrubDelta / currentPoint.total) * 100 : 0;

  const getIdxFromClientX = useCallback((clientX: number) => {
    if (!chartSvgRef.current || chartPoints.length === 0) return chartPoints.length - 1;
    const rect = chartSvgRef.current.getBoundingClientRect();
    const xRatio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const svgX = xRatio * SVG_W;
    let nearest = 0, minDist = Infinity;
    chartPoints.forEach((p, i) => {
      const d = Math.abs(p.x - svgX);
      if (d < minDist) { minDist = d; nearest = i; }
    });
    return nearest;
  }, [chartPoints]);

  // Render each tile's content
  const renderTile = (id: TileId) => {
    switch (id) {
      case 'quick-stats':
        return (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Yearly', value: formatCurrency(yearlyTotal, currency), sub: 'projected' },
              { label: 'Avg / Sub', value: active.length ? formatCurrency(monthlyTotal / active.length, currency) : '—', sub: 'per month' },
            ].map(stat => (
              <div key={stat.label} className="relative rounded-[20px] border border-border/40">
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
                <div className="relative glass-card rounded-[20px] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-[20px] font-bold text-foreground">{stat.value}</p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-primary font-semibold">
                    <ArrowUpRight className="h-3 w-3" />{stat.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'renewals':
        return (
          <div className="relative rounded-[20px] border border-border/40">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
            <div className="relative glass-card rounded-[20px] p-4">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-warning/12">
                    <AlertCircle className="h-3.5 w-3.5 text-warning" />
                  </div>
                  <span className="text-[13px] font-bold text-foreground">Due this week</span>
                </div>
                {upcomingRenewals.length > 0 && (
                  <span className="text-[12px] font-bold text-warning">{formatCurrency(upcomingTotal, currency)}</span>
                )}
              </div>
              {upcomingRenewals.length === 0 ? (
                <p className="text-[12px] text-muted-foreground py-1">No renewals due this week</p>
              ) : (
                <div className="space-y-3">
                  {upcomingRenewals.map(sub => {
                    const days = differenceInDays(new Date(sub.next_billing_date!), new Date());
                    return (
                      <div key={sub.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            'h-2 w-2 rounded-full shrink-0',
                            days === 0 ? 'bg-destructive' : days <= 2 ? 'bg-warning' : 'bg-primary'
                          )} />
                          <span className="text-[13px] font-medium text-foreground">{sub.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-muted-foreground">
                            {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days}d`}
                          </span>
                          <span className="text-[13px] font-bold text-foreground tabular-nums">
                            {formatCurrency(sub.amount, currency)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 'category':
        return (
          <div className="relative rounded-[20px] border border-border/40">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
            <div className="relative glass-card rounded-[20px] p-5">
              <h3 className="text-[13px] font-bold text-foreground mb-4">Spend by Category</h3>
              {categoryData.length === 0 ? (
                <p className="text-[12px] text-muted-foreground py-1">No category data yet</p>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="h-32 w-32 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} dataKey="value" innerRadius={28} outerRadius={52} paddingAngle={3} strokeWidth={0}>
                          {categoryData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {categoryData.slice(0, 4).map((cat, i) => (
                      <div key={cat.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-muted-foreground truncate max-w-[80px]">{cat.name}</span>
                        </div>
                        <span className="font-semibold text-foreground">{formatCurrency(cat.value, currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'gauge-score':
        return <GaugeScoreModule subscriptions={subscriptions} />;

      case 'waste':
        return <WasteDetectionModule subscriptions={subscriptions} currency={currency} onSelect={setSelected} />;

      case 'lifecycle':
        return <LifecycleInsightsModule subscriptions={subscriptions} currency={currency} />;
    }
  };

  return (
    <div className="px-5 pb-28">
      {/* Header */}
      <div className="pt-8 pb-6 flex items-center justify-between">
        <h1 className="text-[32px] font-black tracking-tight text-foreground leading-none">Insights</h1>
        {editMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            onClick={() => setEditMode(false)}
            className="rounded-full bg-primary px-4 py-1.5 text-[13px] font-bold text-primary-foreground"
          >
            Done
          </motion.button>
        )}
      </div>

      {active.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/60">
            <TrendingUp className="h-7 w-7 text-muted-foreground/40" />
          </div>
          <p className="text-base font-bold text-foreground">No data yet</p>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-[200px] leading-relaxed">
            Add subscriptions to unlock spending insights.
          </p>
        </motion.div>
      ) : (
        <>
          {/* ── Monthly Spend Hero ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-[22px] bg-primary overflow-hidden"
          >
            {/* Text section */}
            <div className="pt-7 pb-1 px-5 text-center">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.22em] mb-3"
                style={{ color: 'rgba(0,0,0,0.42)' }}
              >
                Monthly Spend
              </p>
              <p
                className="text-[52px] font-black leading-none tracking-tight"
                style={{ color: 'rgba(0,0,0,0.85)' }}
              >
                {isScrubbing && activePoint
                  ? formatCurrency(activePoint.total, currency)
                  : formatCurrency(displayTotal, currency)}
              </p>
              <p className="mt-2.5 text-[13px]" style={{ color: 'rgba(0,0,0,0.42)' }}>
                {active.length} active subscription{active.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Interactive area chart */}
            <div className="relative mt-3" style={{ height: SVG_H }}>
              {/* Floating tooltip */}
              {isScrubbing && activePoint && (
                <div
                  className="absolute z-20 pointer-events-none"
                  style={{
                    left: `${Math.min(Math.max((activePoint.x / SVG_W) * 100, 18), 82)}%`,
                    top: Math.max(4, activePoint.y - 54),
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(8,8,8,0.86)',
                      borderRadius: 12,
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      backdropFilter: 'blur(8px)',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.28)',
                    }}
                  >
                    <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>
                      {formatCurrency(activePoint.total, currency)}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11 }}>
                      {activePoint.month}
                    </span>
                    {Math.abs(scrubDelta) > 0.005 && (
                      <span style={{
                        color: scrubDelta > 0 ? '#ef4444' : '#4ade80',
                        fontSize: 11,
                        fontWeight: 700,
                      }}>
                        {scrubDelta > 0 ? '+' : '−'}{Math.abs(scrubPct).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              )}

              <svg
                ref={chartSvgRef}
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                width="100%"
                height={SVG_H}
                preserveAspectRatio="none"
                style={{ display: 'block', touchAction: 'none', cursor: 'crosshair' }}
                onPointerDown={e => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setIsScrubbing(true);
                  setActiveIdx(getIdxFromClientX(e.clientX));
                }}
                onPointerMove={e => {
                  if (e.buttons === 0) return;
                  setActiveIdx(getIdxFromClientX(e.clientX));
                }}
                onPointerUp={() => setIsScrubbing(false)}
                onPointerCancel={() => setIsScrubbing(false)}
              >
                <defs>
                  <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.20)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.03)" />
                  </linearGradient>
                </defs>

                {/* Gradient fill */}
                {areaPath && <path d={areaPath} fill="url(#heroAreaGrad)" />}

                {/* White outline */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="rgba(255,255,255,0.88)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Scrub dot */}
                {activePoint && (
                  <g>
                    <circle
                      cx={activePoint.x}
                      cy={activePoint.y}
                      r={isScrubbing ? 10 : 7}
                      fill="rgba(255,255,255,0.25)"
                      style={{ transition: 'r 0.12s ease' }}
                    />
                    <circle
                      cx={activePoint.x}
                      cy={activePoint.y}
                      r={isScrubbing ? 5.5 : 4}
                      fill="white"
                      style={{ transition: 'r 0.12s ease' }}
                    />
                  </g>
                )}
              </svg>
            </div>

            {/* Paused savings pill */}
            {pausedSavings > 0 && (
              <div className="mx-5 mb-4 mt-1 flex items-center gap-2 rounded-xl bg-black/[0.08] px-3 py-2">
                <span className="text-sm">💰</span>
                <p className="text-[11px] font-semibold" style={{ color: 'rgba(0,0,0,0.55)' }}>
                  Saving {formatCurrency(pausedSavings, currency)}/mo — {paused.length} paused
                </p>
              </div>
            )}
          </motion.div>

          {/* ── Draggable tiles ── */}
          {editMode && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-muted-foreground text-center mb-3"
            >
              Hold and drag to reorder
            </motion.p>
          )}

          <Reorder.Group
            as="div"
            axis="y"
            values={tileOrder}
            onReorder={setTileOrder}
            className="flex flex-col gap-4"
          >
            {tileOrder.map(id => (
              <Reorder.Item
                as="div"
                key={id}
                value={id}
                dragListener={editMode}
                dragTransition={{ bounceStiffness: 400, bounceDamping: 35 }}
                whileDrag={{
                  scale: 1.02,
                  boxShadow: '0 20px 48px rgba(0,0,0,0.22)',
                  zIndex: 50,
                  cursor: 'grabbing',
                }}
                style={{ borderRadius: 20, cursor: editMode ? 'grab' : 'default', position: 'relative' }}
              >
                {/* Wiggle wrapper — separate from Reorder.Item so transforms don't conflict */}
                <motion.div
                  animate={{ rotate: editMode ? [-0.55, 0.55] : 0 }}
                  transition={editMode
                    ? { repeat: Infinity, repeatType: 'mirror', duration: 0.22, ease: 'linear' }
                    : { duration: 0.18 }
                  }
                  onPointerDown={startLongPress}
                  onPointerMove={checkLongPressMove}
                  onPointerUp={cancelLongPress}
                  onPointerCancel={cancelLongPress}
                >
                  {/* Grip indicator overlay */}
                  {editMode && (
                    <div className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/[0.08] pointer-events-none">
                      <GripVertical className="h-3.5 w-3.5 text-foreground/50" />
                    </div>
                  )}
                  {renderTile(id)}
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
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
