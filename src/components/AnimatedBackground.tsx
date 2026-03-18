import { useTheme } from '@/hooks/useTheme';

function GradientBlob({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute rounded-full will-change-transform ${className ?? ''}`}
      style={{
        filter: 'blur(120px)',
        ...style,
      }}
    />
  );
}

export default function AnimatedBackground({ children }: { children?: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 overflow-hidden ${isDark ? 'bg-[#100B00]' : 'bg-[#EFFFC8]'}`}>
      {/* Layer 1 — primary green blob */}
      <GradientBlob
        className="animated-blob-1"
        style={{
          width: '70vmax',
          height: '70vmax',
          background: isDark
            ? 'radial-gradient(circle, rgba(133,203,51,0.25) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(133,203,51,0.45) 0%, transparent 70%)',
          top: '-20%',
          left: '-15%',
        }}
      />

      {/* Layer 2 — ash grey / mint blob */}
      <GradientBlob
        className="animated-blob-2"
        style={{
          width: '60vmax',
          height: '60vmax',
          background: isDark
            ? 'radial-gradient(circle, rgba(165,203,195,0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(165,203,195,0.5) 0%, transparent 70%)',
          bottom: '-10%',
          right: '-20%',
        }}
      />

      {/* Layer 3 — dark khaki / deep tone blob */}
      <GradientBlob
        className="animated-blob-3"
        style={{
          width: '55vmax',
          height: '55vmax',
          background: isDark
            ? 'radial-gradient(circle, rgba(59,52,31,0.4) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(133,203,51,0.2) 0%, transparent 70%)',
          top: '30%',
          right: '-10%',
        }}
      />

      {/* Layer 4 — accent green glow */}
      <GradientBlob
        className="animated-blob-4"
        style={{
          width: '50vmax',
          height: '50vmax',
          background: isDark
            ? 'radial-gradient(circle, rgba(133,203,51,0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(239,255,200,0.6) 0%, transparent 70%)',
          bottom: '10%',
          left: '-5%',
        }}
      />

      {/* Content overlay */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
