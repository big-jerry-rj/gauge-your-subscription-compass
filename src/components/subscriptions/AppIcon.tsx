import { useState } from 'react';
import { getServiceBg } from '@/lib/constants';

interface Props {
  logoUrl?: string | null;
  name: string;
  size: number;
  bg?: string;
  className?: string;
}

/**
 * iOS-style squircle app icon.
 * - Colored brand background (from props or auto-detected from service name)
 * - Image covers the container (object-cover)
 * - border-radius: 22% — matches iOS squircle formula
 * - Falls back to bold initial on brand color
 */
export function AppIcon({ logoUrl, name, size, bg, className = '' }: Props) {
  const [failed, setFailed] = useState(false);
  const background = bg ?? getServiceBg(name);
  const radius = Math.round(size * 0.22); // iOS squircle

  return (
    <div
      className={`shrink-0 overflow-hidden flex items-center justify-center ${className}`}
      style={{ width: size, height: size, borderRadius: radius, background }}
    >
      {logoUrl && !failed ? (
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
          loading="eager"
          decoding="sync"
        />
      ) : (
        <span
          style={{
            fontSize: Math.round(size * 0.42),
            fontWeight: 900,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1,
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {name[0].toUpperCase()}
        </span>
      )}
    </div>
  );
}
