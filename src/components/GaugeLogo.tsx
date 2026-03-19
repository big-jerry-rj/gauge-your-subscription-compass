interface GaugeLogoProps {
  className?: string;
  height?: number;
}

export default function GaugeLogo({ className, height = 44 }: GaugeLogoProps) {
  // Aspect ratio of logo: ~2.65:1 (wide pill badge)
  const width = Math.round(height * 2.65);

  return (
    <svg
      viewBox="0 0 180 68"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Gauge"
      role="img"
    >
      <rect width="180" height="68" rx="18" fill="#A3E635" />
      <text
        x="90"
        y="34"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontWeight="800"
        fontSize="38"
        fill="#162800"
        letterSpacing="-0.5"
      >
        Gauge
      </text>
    </svg>
  );
}
