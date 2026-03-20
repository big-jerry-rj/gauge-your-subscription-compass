import { useTheme } from '@/hooks/useTheme';

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isDark) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-background" />

        {/* Subtle primary bokeh — top-left corner only */}
        <div className="absolute" style={{
          width: '60%',
          height: '40%',
          top: '-5%',
          left: '-10%',
          background: 'radial-gradient(ellipse at 0% 0%, hsl(var(--primary) / 0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />

        {/* Subtle primary bokeh — bottom-right corner */}
        <div className="absolute" style={{
          width: '50%',
          height: '35%',
          bottom: '-5%',
          right: '-5%',
          background: 'radial-gradient(ellipse at 100% 100%, hsl(var(--primary) / 0.03) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
      </div>
    );
  }

  // Light mode — near-white base with two subtle corner whispers
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 transition-colors duration-700 bg-background" />

      {/* Blob 1 — top-left primary whisper */}
      <div className="absolute animate-blob1 will-change-transform" style={{
        width: '55vw', height: '55vw', top: '-15%', left: '-15%', borderRadius: '50%',
        background: 'radial-gradient(circle, hsl(var(--primary) / 0.10) 0%, transparent 65%)',
        filter: 'blur(80px)',
      }} />

      {/* Blob 2 — bottom-right teal whisper */}
      <div className="absolute animate-blob3 will-change-transform" style={{
        width: '50vw', height: '50vw', bottom: '-15%', right: '-15%', borderRadius: '50%',
        background: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.09) 0%, transparent 65%)',
        filter: 'blur(80px)',
      }} />

      <div className="absolute inset-0" style={{
        backgroundImage: GRAIN,
        backgroundSize: '128px 128px',
        opacity: 0.04,
        mixBlendMode: 'multiply',
      }} />
    </div>
  );
}
