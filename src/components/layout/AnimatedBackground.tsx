import { useTheme } from '@/hooks/useTheme';

export default function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base color layer */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{ backgroundColor: isDark ? '#100B00' : '#EFFFC8' }}
      />

      {/* Blob 1 — Primary green glow */}
      <div
        className="absolute animate-blob1 will-change-transform"
        style={{
          width: '130vw',
          height: '130vw',
          top: '-20%',
          left: '-15%',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(133,203,51,0.28) 0%, rgba(133,203,51,0.08) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(133,203,51,0.45) 0%, rgba(133,203,51,0.15) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Blob 2 — Dark khaki / earthy depth */}
      <div
        className="absolute animate-blob2 will-change-transform"
        style={{
          width: '110vw',
          height: '110vw',
          bottom: '-25%',
          right: '-20%',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(59,52,31,0.6) 0%, rgba(59,52,31,0.2) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(165,203,195,0.5) 0%, rgba(165,203,195,0.15) 45%, transparent 70%)',
          filter: 'blur(90px)',
        }}
      />

      {/* Blob 3 — Ash grey / cool accent */}
      <div
        className="absolute animate-blob3 will-change-transform"
        style={{
          width: '100vw',
          height: '100vw',
          top: '30%',
          right: '-30%',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(165,203,195,0.15) 0%, rgba(165,203,195,0.05) 40%, transparent 65%)'
            : 'radial-gradient(circle, rgba(133,203,51,0.3) 0%, rgba(239,255,200,0.4) 40%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />

      {/* Blob 4 — Secondary green highlight */}
      <div
        className="absolute animate-blob4 will-change-transform"
        style={{
          width: '90vw',
          height: '90vw',
          bottom: '10%',
          left: '-25%',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(133,203,51,0.18) 0%, rgba(16,11,0,0.3) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(165,203,195,0.4) 0%, rgba(239,255,200,0.3) 45%, transparent 70%)',
          filter: 'blur(85px)',
        }}
      />

      {/* Blob 5 — Subtle warm core */}
      <div
        className="absolute animate-blob5 will-change-transform"
        style={{
          width: '80vw',
          height: '80vw',
          top: '15%',
          left: '20%',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(59,52,31,0.35) 0%, rgba(133,203,51,0.1) 40%, transparent 65%)'
            : 'radial-gradient(circle, rgba(239,255,200,0.6) 0%, rgba(133,203,51,0.1) 50%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
          opacity: isDark ? 0.035 : 0.04,
          mixBlendMode: isDark ? 'screen' : 'multiply',
        }}
      />

      {/* Soft vignette for readability */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, transparent 40%, rgba(16,11,0,0.4) 100%)'
            : 'radial-gradient(ellipse at center, transparent 50%, rgba(239,255,200,0.3) 100%)',
        }}
      />
    </div>
  );
}
