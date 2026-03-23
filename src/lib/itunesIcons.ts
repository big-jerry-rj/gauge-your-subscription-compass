const CACHE_KEY = 'gauge-itunes-icons-v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Hydrate synchronously from localStorage on module init — icons are correct on first render after initial load
let _cache: Record<string, string> = {};
try {
  const raw = localStorage.getItem(CACHE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (Date.now() - (parsed.timestamp ?? 0) < CACHE_TTL_MS) {
      _cache = parsed.icons ?? {};
    }
  }
} catch {}

export function getItunesIcon(serviceName: string): string | null {
  return _cache[serviceName] ?? null;
}

function persistCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), icons: _cache }));
  } catch {}
}

// iTunes search terms optimised to return the correct app as first result
const ITUNES_TERMS: Record<string, string> = {
  'Netflix': 'Netflix',
  'YouTube Premium': 'YouTube',
  'Disney+': 'Disney+',
  'HBO Max': 'Max',
  'Apple TV+': 'Apple TV',
  'Hulu': 'Hulu',
  'Amazon Prime': 'Amazon Prime Video',
  'Peacock': 'Peacock TV',
  'Paramount+': 'Paramount+',
  'Crunchyroll': 'Crunchyroll',
  'Spotify': 'Spotify Music',
  'Apple Music': 'Apple Music',
  'Tidal': 'Tidal Music',
  'Deezer': 'Deezer Music Streaming',
  'SoundCloud Go': 'SoundCloud',
  'iCloud+': 'iCloud',
  'Google One': 'Google One',
  'Dropbox': 'Dropbox',
  'OneDrive': 'Microsoft OneDrive',
  'Microsoft 365': 'Microsoft 365',
  'Notion': 'Notion',
  'Slack': 'Slack',
  'Zoom': 'Zoom',
  'Figma': 'Figma',
  'Grammarly': 'Grammarly Keyboard',
  'Canva Pro': 'Canva',
  'Evernote': 'Evernote',
  'Trello': 'Trello',
  'Adobe Creative Cloud': 'Adobe Creative Cloud',
  'GitHub': 'GitHub',
  'ChatGPT Plus': 'ChatGPT',
  '1Password': '1Password – Password Manager',
  'NordVPN': 'NordVPN',
  'ExpressVPN': 'ExpressVPN',
  'Dashlane': 'Dashlane Password Manager',
  'Duolingo Plus': 'Duolingo',
  'Coursera': 'Coursera',
  'MasterClass': 'MasterClass',
  'Skillshare': 'Skillshare',
  'Audible': 'Audible',
  'Headspace': 'Headspace',
  'Calm': 'Calm',
  'Strava': 'Strava Run Ride Hike',
  'MyFitnessPal': 'MyFitnessPal',
  'Peloton': 'Peloton',
  'Xbox Game Pass': 'Xbox Game Pass',
  'PlayStation Plus': 'PlayStation App',
  'Nintendo Online': 'Nintendo Switch Online',
  'LinkedIn Premium': 'LinkedIn',
  'Discord Nitro': 'Discord',
  'Twitch': 'Twitch',
};

async function fetchOne(term: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&country=us&limit=3`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (data.results?.[0]?.artworkUrl512 as string | undefined) ?? null;
  } catch {
    return null;
  }
}

// Singleton promise so many AppIcon instances don't trigger redundant fetches
let _fetchPromise: Promise<void> | null = null;

export function prefetchItunesIcons(): Promise<void> {
  // Already fully cached and fresh
  const cachedCount = Object.keys(_cache).length;
  const totalCount = Object.keys(ITUNES_TERMS).length;
  if (cachedCount >= totalCount * 0.9) return Promise.resolve();

  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = (async () => {
    const entries = Object.entries(ITUNES_TERMS).filter(([name]) => !_cache[name]);
    const BATCH = 8;

    for (let i = 0; i < entries.length; i += BATCH) {
      const batch = entries.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(async ([name, term]) => {
          const url = await fetchOne(term);
          return { name, url };
        })
      );
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value.url) {
          _cache[r.value.name] = r.value.url;
        }
      });
    }

    persistCache();
    _fetchPromise = null;
  })();

  return _fetchPromise;
}

// Callbacks registered by AppIcon instances to re-render when cache populates
const _listeners = new Set<() => void>();

export function subscribeToIconCache(cb: () => void): () => void {
  _listeners.add(cb);
  return () => _listeners.delete(cb);
}

// Notify all AppIcon components once the prefetch is done
export function notifyIconListeners() {
  _listeners.forEach(cb => cb());
}

export function prefetchAndNotify(): void {
  prefetchItunesIcons().then(() => notifyIconListeners());
}
