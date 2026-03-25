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
  '1Password': '1Password – Password Manager',
  'Adobe Creative Cloud': 'Adobe Creative Cloud',
  'Airtable': 'Airtable',
  'Amazon Music': 'Amazon Music',
  'Amazon Prime': 'Amazon Prime Video',
  'Apple Arcade': 'Apple Arcade',
  'Apple Music': 'Apple Music',
  'Apple News+': 'Apple News',
  'Apple TV+': 'Apple TV',
  'Asana': 'Asana',
  'Audible': 'Audible',
  'Babbel': 'Babbel',
  'Bitwarden': 'Bitwarden Password Manager',
  'BritBox': 'BritBox',
  'Brilliant': 'Brilliant',
  'Calm': 'Calm',
  'Canva Pro': 'Canva',
  'ChatGPT Plus': 'ChatGPT',
  'Cloudflare': 'Cloudflare WARP',
  'Codecademy': 'Codecademy Go',
  'Copilot': 'Copilot Budget & Finance Tracker',
  'Coursera': 'Coursera',
  'Crunchyroll': 'Crunchyroll',
  'DashPass': 'DoorDash',
  'Dashlane': 'Dashlane Password Manager',
  'Deezer': 'Deezer Music Streaming',
  'Discord Nitro': 'Discord',
  'Discovery+': 'discovery+',
  'Disney+': 'Disney+',
  'Dropbox': 'Dropbox',
  'Duolingo Plus': 'Duolingo',
  'EA Play': 'EA Play',
  'ESPN+': 'ESPN',
  'Evernote': 'Evernote',
  'ExpressVPN': 'ExpressVPN',
  'Figma': 'Figma',
  'Freeletics': 'Freeletics',
  'FuboTV': 'Fubo Sports & Live TV',
  'GitHub': 'GitHub',
  'Google One': 'Google One',
  'Grammarly': 'Grammarly Keyboard',
  'HBO Max': 'Max',
  'Headspace': 'Headspace',
  'Hulu': 'Hulu',
  'iCloud+': 'iCloud',
  'Instacart+': 'Instacart Shopper',
  'Keeper': 'Keeper Password Manager',
  'Linear': 'Linear',
  'LinkedIn Learning': 'LinkedIn Learning',
  'LinkedIn Premium': 'LinkedIn',
  'Loom': 'Loom',
  'MasterClass': 'MasterClass',
  'Microsoft 365': 'Microsoft 365',
  'Miro': 'Miro',
  'Monarch Money': 'Monarch Money',
  'Monday.com': 'monday.com',
  'MUBI': 'MUBI',
  'MyFitnessPal': 'MyFitnessPal',
  'NBA League Pass': 'NBA',
  'Netflix': 'Netflix',
  'New York Times': 'The New York Times',
  'Nike Training Club': 'Nike Training Club',
  'Nintendo Online': 'Nintendo Switch Online',
  'NordVPN': 'NordVPN',
  'Noom': 'Noom',
  'Notion': 'Notion',
  'OneDrive': 'Microsoft OneDrive',
  'Pandora': 'Pandora Music & Radio',
  'Paramount+': 'Paramount+',
  'Patreon': 'Patreon',
  'Peacock': 'Peacock TV',
  'Peloton': 'Peloton',
  'Philo': 'Philo Live & On-Demand TV',
  'PlayStation Plus': 'PlayStation App',
  'Setapp': 'Setapp',
  'Shudder': 'Shudder',
  'Skillshare': 'Skillshare',
  'Slack': 'Slack',
  'SoundCloud Go': 'SoundCloud',
  'Spotify': 'Spotify Music',
  'Strava': 'Strava Run Ride Hike',
  'Substack': 'Substack',
  'Tailscale': 'Tailscale',
  'The Athletic': 'The Athletic',
  'Tidal': 'Tidal Music',
  'Todoist': 'Todoist',
  'Trello': 'Trello',
  'Twitch': 'Twitch',
  'Uber One': 'Uber',
  'Ubisoft+': 'Ubisoft Connect',
  'Wall Street Journal': 'The Wall Street Journal',
  'Washington Post': 'The Washington Post',
  'WHOOP': 'WHOOP',
  'WW': 'WeightWatchers',
  'X Premium': 'X',
  'Xbox Game Pass': 'Xbox Game Pass',
  'YNAB': 'YNAB',
  'YouTube Music': 'YouTube Music',
  'YouTube Premium': 'YouTube',
  'Zoom': 'Zoom',
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

export interface ItunesApp {
  trackName: string;
  artworkUrl512: string;
  artistName: string;
  primaryGenreName: string;
}

export async function searchItunesApps(term: string, limit = 6): Promise<ItunesApp[]> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&country=us&limit=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map((r: any) => ({
      trackName: r.trackName,
      artworkUrl512: r.artworkUrl512,
      artistName: r.artistName,
      primaryGenreName: r.primaryGenreName ?? '',
    }));
  } catch { return []; }
}

export function mapGenreToCategory(genre: string): string {
  const g = genre.toLowerCase();
  if (g.includes('music')) return 'Music';
  if (g.includes('entertainment') || g.includes('video')) return 'Entertainment';
  if (g.includes('game')) return 'Gaming';
  if (g.includes('health') || g.includes('fitness')) return 'Health & Fitness';
  if (g.includes('education')) return 'Education';
  if (g.includes('productivity')) return 'Productivity';
  if (g.includes('news')) return 'News & Media';
  if (g.includes('finance') || g.includes('business')) return 'Finance';
  return '';
}
