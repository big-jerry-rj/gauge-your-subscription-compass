export const CURRENCIES = [
  { code: 'EUR', symbol: '\u20AC', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '\u00A3', name: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '\u00A5', name: 'Japanese Yen' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'INR', symbol: '\u20B9', name: 'Indian Rupee' },
] as const;

export type CategoryKey =
  | 'streaming' | 'music' | 'gaming' | 'software' | 'cloud'
  | 'fitness' | 'news' | 'food' | 'productivity' | 'education'
  | 'shopping' | 'finance' | 'other';

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'streaming', label: 'Streaming', emoji: '\uD83C\uDFAC', color: '#E74C3C' },
  { key: 'music', label: 'Music', emoji: '\uD83C\uDFB5', color: '#9B59B6' },
  { key: 'gaming', label: 'Gaming', emoji: '\uD83C\uDFAE', color: '#2ECC71' },
  { key: 'software', label: 'Software', emoji: '\uD83D\uDCBB', color: '#3498DB' },
  { key: 'cloud', label: 'Cloud Storage', emoji: '\u2601\uFE0F', color: '#1ABC9C' },
  { key: 'fitness', label: 'Fitness', emoji: '\uD83C\uDFCB\uFE0F', color: '#E67E22' },
  { key: 'news', label: 'News & Media', emoji: '\uD83D\uDCF0', color: '#F39C12' },
  { key: 'food', label: 'Food & Delivery', emoji: '\uD83C\uDF55', color: '#E91E63' },
  { key: 'productivity', label: 'Productivity', emoji: '\u2705', color: '#00BCD4' },
  { key: 'education', label: 'Education', emoji: '\uD83C\uDF93', color: '#8BC34A' },
  { key: 'shopping', label: 'Shopping', emoji: '\uD83D\uDED2', color: '#FF5722' },
  { key: 'finance', label: 'Finance', emoji: '\uD83D\uDCB0', color: '#607D8B' },
  { key: 'other', label: 'Other', emoji: '\uD83D\uDCCC', color: '#95A5A6' },
];

export function getCategoryInfo(key: string | null): CategoryInfo {
  return CATEGORIES.find(c => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}

export const BILLING_CYCLES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi-annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
] as const;

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual';

export const POPULAR_SERVICES = [
  { name: 'Netflix', category: 'streaming' as CategoryKey, defaultPrice: 15.49 },
  { name: 'Spotify', category: 'music' as CategoryKey, defaultPrice: 10.99 },
  { name: 'Disney+', category: 'streaming' as CategoryKey, defaultPrice: 8.99 },
  { name: 'YouTube Premium', category: 'streaming' as CategoryKey, defaultPrice: 13.99 },
  { name: 'Apple Music', category: 'music' as CategoryKey, defaultPrice: 10.99 },
  { name: 'iCloud+', category: 'cloud' as CategoryKey, defaultPrice: 2.99 },
  { name: 'Google One', category: 'cloud' as CategoryKey, defaultPrice: 1.99 },
  { name: 'Adobe CC', category: 'software' as CategoryKey, defaultPrice: 54.99 },
  { name: 'Microsoft 365', category: 'productivity' as CategoryKey, defaultPrice: 9.99 },
  { name: 'Amazon Prime', category: 'shopping' as CategoryKey, defaultPrice: 8.99 },
  { name: 'HBO Max', category: 'streaming' as CategoryKey, defaultPrice: 13.99 },
  { name: 'Notion', category: 'productivity' as CategoryKey, defaultPrice: 10.00 },
  { name: 'Figma', category: 'software' as CategoryKey, defaultPrice: 15.00 },
  { name: 'ChatGPT Plus', category: 'software' as CategoryKey, defaultPrice: 20.00 },
  { name: 'Gym', category: 'fitness' as CategoryKey, defaultPrice: 29.99 },
] as const;

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? code;
}

export function formatCurrency(amount: number, currencyCode: string = 'EUR'): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
}

export function calculateNextBillingDate(startDate: string, billingCycle: BillingCycle): string {
  const start = new Date(startDate);
  const now = new Date();
  const next = new Date(start);

  while (next <= now) {
    switch (billingCycle) {
      case 'weekly': next.setDate(next.getDate() + 7); break;
      case 'monthly': next.setMonth(next.getMonth() + 1); break;
      case 'quarterly': next.setMonth(next.getMonth() + 3); break;
      case 'semi-annual': next.setMonth(next.getMonth() + 6); break;
      case 'annual': next.setFullYear(next.getFullYear() + 1); break;
    }
  }
  return next.toISOString().split('T')[0];
}

export function getMonthlyAmount(price: number, billingCycle: string): number {
  switch (billingCycle) {
    case 'weekly': return price * 4.33;
    case 'monthly': return price;
    case 'quarterly': return price / 3;
    case 'semi-annual': return price / 6;
    case 'annual': return price / 12;
    default: return price;
  }
}
