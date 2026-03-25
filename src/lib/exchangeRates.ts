const CACHE_KEY = 'gauge-fx-rates-v2';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

export interface RatesCache {
  rates: Record<string, number>; // all relative to USD (USD = 1)
  timestamp: number;
}

// In-memory cache so components on the same render cycle share the same object
let _mem: RatesCache | null = null;

function readLocal(): RatesCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: RatesCache = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL) return null;
    return parsed;
  } catch { return null; }
}

function writeLocal(entry: RatesCache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(entry)); } catch {}
}

let _inflight: Promise<Record<string, number>> | null = null;

export async function fetchRates(): Promise<Record<string, number>> {
  if (_mem && Date.now() - _mem.timestamp < CACHE_TTL) return _mem.rates;

  const local = readLocal();
  if (local) { _mem = local; return local.rates; }

  if (_inflight) return _inflight;

  _inflight = (async () => {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('rate fetch failed');
      const data = await res.json();
      const entry: RatesCache = { rates: data.rates as Record<string, number>, timestamp: Date.now() };
      _mem = entry;
      writeLocal(entry);
      return entry.rates;
    } catch {
      // Return in-memory (possibly stale) or empty — callers show unconverted amounts
      return _mem?.rates ?? {};
    } finally {
      _inflight = null;
    }
  })();

  return _inflight;
}

/**
 * Convert `amount` from one currency code to another using a rates object
 * where every rate is expressed relative to USD (e.g. rates.EUR = 0.92 means $1 = €0.92).
 */
export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
): number {
  if (!from || !to || from === to) return amount;
  const rFrom = rates[from.toUpperCase()];
  const rTo   = rates[to.toUpperCase()];
  if (!rFrom || !rTo) return amount; // unknown currency — show as-is
  return (amount / rFrom) * rTo;
}
