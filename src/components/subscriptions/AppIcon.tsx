import { useState, useEffect } from 'react';
import { getServiceBg } from '@/lib/constants';
import { getItunesIcon, subscribeToIconCache } from '@/lib/itunesIcons';

interface Props {
  logoUrl?: string | null;
  name: string;
  size: number;
  bg?: string;
  className?: string;
}

/**
 * iOS-style squircle app icon.
 * - Prioritises Apple App Store artwork (512px) fetched via iTunes Search API
 * - Falls back to the Google-favicon URL passed in via logoUrl
 * - Final fallback: bold initial on brand colour
 * - border-radius: 22% — iOS squircle formula
 */
export function AppIcon({ logoUrl, name, size, bg, className = '' }: Props) {
  const [failed, setFailed] = useState(false);
  // Seed from synchronous cache first (populated from localStorage on module load)
  const [itunesUrl, setItunesUrl] = useState<string | null>(() => getItunesIcon(name));

  useEffect(() => {
    // Re-read from cache when the global prefetch resolves
    const unsub = subscribeToIconCache(() => {
      const url = getItunesIcon(name);
      if (url) setItunesUrl(url);
    });
    // Also check immediately in case cache was populated between render and effect
    const url = getItunesIcon(name);
    if (url) setItunesUrl(url);
    return unsub;
  }, [name]);

  // Reset failed state when the URL source changes
  useEffect(() => { setFailed(false); }, [itunesUrl]);

  const background = bg ?? getServiceBg(name);
  const radius = Math.round(size * 0.22); // iOS squircle
  const displayUrl = itunesUrl ?? logoUrl;

  return (
    <div
      className={`shrink-0 overflow-hidden flex items-center justify-center ${className}`}
      style={{ width: size, height: size, borderRadius: radius, background }}
    >
      {displayUrl && !failed ? (
        <img
          src={displayUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
          loading="eager"
          decoding="async"
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
