import { useTheme } from '@/hooks/useTheme';

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isDark) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Pure near-black base */}
        <div className="absolute inset-0" style={{ background: '#0F0F0F' }} />

        {/* Subtle lime bokeh — top-left corner only */}
        <div className="absolute" style={{
          width: '60%',
          height: '40%',
          top: '-5%',
          left: '-10%',
          background: 'radial-gradient(ellipse at 0% 0%, rgba(194,255,0,0.04) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />

        {/* Subtle lime bokeh — bottom-right corner */}
        <div className="absolute" style={{
          width: '50%',
          height: '35%',
          bottom: '-5%',
          right: '-5%',
          background: 'radial-gradient(ellipse at 100% 100%, rgba(194,255,0,0.03) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }} />
      </div>
    );
  }

  // Light mode — keep the lively blob system
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: '#EFFFC8' }} />

      <div className="absolute animate-blob1 will-change-transform" style={{
        width: '130vw', height: '130vw', top: '-20%', left: '-15%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(133,203,51,0.45) 0%, rgba(133,203,51,0.15) 40%, transparent 70%)',
        filter: 'blur(80px)',
      }} />
      <div className="absolute animate-blob2 will-change-transform" style={{
        width: '110vw', height: '110vw', bottom: '-25%', right: '-20%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(165,203,195,0.5) 0%, rgba(165,203,195,0.15) 45%, transparent 70%)',
        filter: 'blur(90px)',
      }} />
      <div className="absolute animate-blob3 will-change-transform" style={{
        width: '100vw', height: '100vw', top: '30%', right: '-30%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(133,203,51,0.3) 0%, rgba(239,255,200,0.4) 40%, transparent 70%)',
        filter: 'blur(100px)',
      }} />
      <div className="absolute animate-blob4 will-change-transform" style={{
        width: '90vw', height: '90vw', bottom: '10%', left: '-25%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(165,203,195,0.4) 0%, rgba(239,255,200,0.3) 45%, transparent 70%)',
        filter: 'blur(85px)',
      }} />
      <div className="absolute animate-blob5 will-change-transform" style={{
        width: '80vw', height: '80vw', top: '15%', left: '20%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,255,200,0.6) 0%, rgba(133,203,51,0.1) 50%, transparent 70%)',
        filter: 'blur(70px)',
      }} />

      <div className="absolute inset-0" style={{
        backgroundImage: GRAIN,
        backgroundSize: '128px 128px',
        opacity: 0.04,
        mixBlendMode: 'multiply',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(239,255,200,0.3) 100%)',
      }} />
    </div>
  );
}
