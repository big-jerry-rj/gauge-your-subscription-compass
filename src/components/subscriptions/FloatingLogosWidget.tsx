import { useState } from 'react';
import { Subscription } from '@/hooks/useSubscriptions';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { GlowingEffect } from '@/components/ui/glowing-effect';

interface Props {
  subscriptions: Subscription[];
  onSelectSub?: (sub: Subscription) => void;
}

// Organic bubble cluster — two staggered rows
const POSITIONS = [
  { left: '4%',  top: '6%',  size: 60, floatY: 8,  dur: 3.4 },
  { left: '25%', top: '2%',  size: 52, floatY: 9,  dur: 3.8 },
  { left: '47%', top: '4%',  size: 58, floatY: 7,  dur: 3.2 },
  { left: '69%', top: '8%',  size: 50, floatY: 10, dur: 4.0 },
  { left: '3%',  top: '50%', size: 54, floatY: 9,  dur: 3.6 },
  { left: '26%', top: '54%', size: 46, floatY: 8,  dur: 3.5 },
  { left: '50%', top: '52%', size: 52, floatY: 7,  dur: 3.3 },
  { left: '74%', top: '50%', size: 44, floatY: 9,  dur: 3.9 },
];

function SubLogo({
  sub,
  size,
  className = '',
}: {
  sub: Subscription;
  size: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`overflow-hidden rounded-full bg-muted shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
      }}
    >
      {sub.logo_url && !failed ? (
        <img
          src={sub.logo_url}
          alt={sub.name}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-primary/10">
          <span
            className="font-black text-primary"
            style={{ fontSize: Math.round(size * 0.38) }}
          >
            {sub.name[0]}
          </span>
        </div>
      )}
    </div>
  );
}

export { SubLogo };

export default function FloatingLogosWidget({ subscriptions, onSelectSub }: Props) {
  const [expanded, setExpanded] = useState(false);
  const active = subscriptions.filter(s => s.status === 'active');
  const preview = active.slice(0, POSITIONS.length);

  if (active.length === 0) return null;

  return (
    <>
      {/* Widget card */}
      <div className="relative rounded-[20px] border border-border/40 mb-4">
        <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
        <div className="relative glass-card rounded-[20px] overflow-hidden" style={{ height: 192 }}>

          {/* Floating logo bubbles */}
          {preview.map((sub, i) => {
            const pos = POSITIONS[i];
            return (
              <motion.button
                key={sub.id}
                className="absolute focus:outline-none"
                style={{ left: pos.left, top: pos.top }}
                onClick={() => onSelectSub?.(sub)}
                animate={{ y: [0, -pos.floatY, 0] }}
                transition={{
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: pos.dur,
                  delay: i * 0.18,
                  ease: 'easeInOut',
                }}
                whileTap={{ scale: 0.88 }}
              >
                <SubLogo sub={sub} size={pos.size} />
              </motion.button>
            );
          })}

          {/* Gradient fade at bottom so count is readable */}
          <div
            className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, hsl(var(--card) / 0.85) 0%, transparent 100%)',
            }}
          />

          {/* Count badge */}
          <div className="absolute bottom-4 left-5 flex items-baseline gap-1.5 pointer-events-none">
            <span className="text-[32px] font-black text-foreground leading-none">{active.length}</span>
            <span className="text-[13px] font-semibold text-muted-foreground">Subs</span>
          </div>

          {/* Expand button */}
          <button
            onClick={() => setExpanded(true)}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/[0.08] backdrop-blur-sm hover:bg-foreground/[0.14] transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5 text-foreground/70" />
          </button>
        </div>
      </div>

      {/* Full-screen expanded grid */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex flex-col bg-background"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-14 pb-5">
              <div>
                <h2 className="text-[26px] font-black text-foreground leading-tight">All subscriptions</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">{active.length} active</p>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>

            {/* Logo grid */}
            <div className="flex-1 overflow-y-auto px-5 pb-10">
              <div className="grid grid-cols-4 gap-y-6 gap-x-3">
                {active.map((sub, i) => (
                  <motion.button
                    key={sub.id}
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.025, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center gap-2 focus:outline-none"
                    onClick={() => {
                      setExpanded(false);
                      setTimeout(() => onSelectSub?.(sub), 200);
                    }}
                  >
                    <SubLogo sub={sub} size={68} />
                    <span className="text-[11px] font-semibold text-foreground text-center leading-tight line-clamp-2 max-w-[72px]">
                      {sub.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
