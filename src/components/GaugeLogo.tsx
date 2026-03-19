import { useTheme } from '@/hooks/useTheme';

interface GaugeLogoProps {
  className?: string;
  height?: number;
}

export default function GaugeLogo({ className, height = 20 }: GaugeLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <img
      src={isDark ? '/gauge-green.png' : '/gauge-black.png'}
      alt="Gauge"
      height={height}
      style={{ height, width: 'auto' }}
      className={className}
      draggable={false}
    />
  );
}
