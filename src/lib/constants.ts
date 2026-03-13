export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
] as const;

export const CATEGORIES = [
  'Entertainment',
  'Music',
  'Video Streaming',
  'Gaming',
  'Productivity',
  'Cloud Storage',
  'News & Media',
  'Health & Fitness',
  'Education',
  'Finance',
  'Software',
  'Social Media',
  'Food & Delivery',
  'Shopping',
  'Other',
] as const;

export const POPULAR_SERVICES = [
  { name: 'Netflix', logo: 'https://logo.clearbit.com/netflix.com', category: 'Video Streaming', defaultAmount: 15.49 },
  { name: 'Spotify', logo: 'https://logo.clearbit.com/spotify.com', category: 'Music', defaultAmount: 10.99 },
  { name: 'Disney+', logo: 'https://logo.clearbit.com/disneyplus.com', category: 'Video Streaming', defaultAmount: 8.99 },
  { name: 'YouTube Premium', logo: 'https://logo.clearbit.com/youtube.com', category: 'Video Streaming', defaultAmount: 13.99 },
  { name: 'Apple Music', logo: 'https://logo.clearbit.com/apple.com', category: 'Music', defaultAmount: 10.99 },
  { name: 'iCloud+', logo: 'https://logo.clearbit.com/icloud.com', category: 'Cloud Storage', defaultAmount: 2.99 },
  { name: 'Google One', logo: 'https://logo.clearbit.com/one.google.com', category: 'Cloud Storage', defaultAmount: 1.99 },
  { name: 'Adobe Creative Cloud', logo: 'https://logo.clearbit.com/adobe.com', category: 'Software', defaultAmount: 54.99 },
  { name: 'Microsoft 365', logo: 'https://logo.clearbit.com/microsoft.com', category: 'Productivity', defaultAmount: 9.99 },
  { name: 'Amazon Prime', logo: 'https://logo.clearbit.com/amazon.com', category: 'Shopping', defaultAmount: 8.99 },
  { name: 'HBO Max', logo: 'https://logo.clearbit.com/hbomax.com', category: 'Video Streaming', defaultAmount: 13.99 },
  { name: 'Notion', logo: 'https://logo.clearbit.com/notion.so', category: 'Productivity', defaultAmount: 10.00 },
  { name: 'Figma', logo: 'https://logo.clearbit.com/figma.com', category: 'Software', defaultAmount: 15.00 },
  { name: 'Slack', logo: 'https://logo.clearbit.com/slack.com', category: 'Productivity', defaultAmount: 8.75 },
  { name: 'Dropbox', logo: 'https://logo.clearbit.com/dropbox.com', category: 'Cloud Storage', defaultAmount: 11.99 },
  { name: 'ChatGPT Plus', logo: 'https://logo.clearbit.com/openai.com', category: 'Software', defaultAmount: 20.00 },
  { name: 'Gym Membership', logo: '', category: 'Health & Fitness', defaultAmount: 29.99 },
  { name: 'LinkedIn Premium', logo: 'https://logo.clearbit.com/linkedin.com', category: 'Social Media', defaultAmount: 29.99 },
  { name: 'Hulu', logo: 'https://logo.clearbit.com/hulu.com', category: 'Video Streaming', defaultAmount: 17.99 },
  { name: 'Paramount+', logo: 'https://logo.clearbit.com/paramountplus.com', category: 'Video Streaming', defaultAmount: 11.99 },
] as const;

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol ?? code;
}

export function formatCurrency(amount: number, currencyCode: string = 'EUR'): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
}

export function calculateNextBillingDate(startDate: string, billingCycle: string): string {
  const start = new Date(startDate);
  const now = new Date();
  let next = new Date(start);

  while (next <= now) {
    switch (billingCycle) {
      case 'weekly': next.setDate(next.getDate() + 7); break;
      case 'monthly': next.setMonth(next.getMonth() + 1); break;
      case 'quarterly': next.setMonth(next.getMonth() + 3); break;
      case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
    }
  }
  return next.toISOString().split('T')[0];
}

export function getMonthlyAmount(amount: number, billingCycle: string): number {
  switch (billingCycle) {
    case 'weekly': return amount * 4.33;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'yearly': return amount / 12;
    default: return amount;
  }
}
