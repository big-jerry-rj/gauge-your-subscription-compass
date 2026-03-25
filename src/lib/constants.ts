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

// High-quality favicon from Google (256px) + Clearbit fallback
const icon = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;

export const POPULAR_SERVICES = [
  { name: '1Password',             logo: icon('1password.com'),        bg: '#1A8CFF', category: 'Software',         defaultAmount: 3.99  },
  { name: 'Adobe Creative Cloud',  logo: icon('adobe.com'),            bg: '#FF0000', category: 'Software',         defaultAmount: 54.99 },
  { name: 'Airtable',              logo: icon('airtable.com'),         bg: '#2D7FF9', category: 'Productivity',     defaultAmount: 10.00 },
  { name: 'Amazon Music',          logo: icon('music.amazon.com'),     bg: '#25D1DA', category: 'Music',            defaultAmount: 8.99  },
  { name: 'Amazon Prime',          logo: icon('primevideo.com'),       bg: '#00A8E1', category: 'Video Streaming',  defaultAmount: 8.99  },
  { name: 'Apple Arcade',          logo: icon('apps.apple.com'),       bg: '#000000', category: 'Gaming',           defaultAmount: 4.99  },
  { name: 'Apple Music',           logo: icon('music.apple.com'),      bg: '#FC3C44', category: 'Music',            defaultAmount: 10.99 },
  { name: 'Apple News+',           logo: icon('news.apple.com'),       bg: '#FC3C44', category: 'News & Media',     defaultAmount: 12.99 },
  { name: 'Apple TV+',             logo: icon('tv.apple.com'),         bg: '#000000', category: 'Video Streaming',  defaultAmount: 8.99  },
  { name: 'Asana',                 logo: icon('asana.com'),            bg: '#FF471A', category: 'Productivity',     defaultAmount: 10.99 },
  { name: 'Audible',               logo: icon('audible.com'),          bg: '#FF9900', category: 'Education',        defaultAmount: 14.95 },
  { name: 'Babbel',                logo: icon('babbel.com'),           bg: '#5BC4A5', category: 'Education',        defaultAmount: 6.95  },
  { name: 'Bitwarden',             logo: icon('bitwarden.com'),        bg: '#175DDC', category: 'Software',         defaultAmount: 1.00  },
  { name: 'BritBox',               logo: icon('britbox.com'),          bg: '#3D2B7D', category: 'Video Streaming',  defaultAmount: 8.99  },
  { name: 'Brilliant',             logo: icon('brilliant.org'),        bg: '#FF6B00', category: 'Education',        defaultAmount: 24.99 },
  { name: 'Calm',                  logo: icon('calm.com'),             bg: '#4A4A8A', category: 'Health & Fitness', defaultAmount: 14.99 },
  { name: 'Canva Pro',             logo: icon('canva.com'),            bg: '#7D2AE8', category: 'Productivity',     defaultAmount: 12.99 },
  { name: 'ChatGPT Plus',          logo: icon('openai.com'),           bg: '#10A37F', category: 'Software',         defaultAmount: 20.00 },
  { name: 'Cloudflare',            logo: icon('cloudflare.com'),       bg: '#F48120', category: 'Software',         defaultAmount: 20.00 },
  { name: 'Codecademy',            logo: icon('codecademy.com'),       bg: '#1F4056', category: 'Education',        defaultAmount: 17.99 },
  { name: 'Copilot',               logo: icon('copilot.money'),        bg: '#7B61FF', category: 'Finance',          defaultAmount: 9.99  },
  { name: 'Coursera',              logo: icon('coursera.org'),         bg: '#0056D2', category: 'Education',        defaultAmount: 59.00 },
  { name: 'Crunchyroll',           logo: icon('crunchyroll.com'),      bg: '#F47521', category: 'Video Streaming',  defaultAmount: 7.99  },
  { name: 'DashPass',              logo: icon('doordash.com'),         bg: '#FF3008', category: 'Food & Delivery',  defaultAmount: 9.99  },
  { name: 'Dashlane',              logo: icon('dashlane.com'),         bg: '#0A223A', category: 'Software',         defaultAmount: 4.99  },
  { name: 'Deezer',                logo: icon('deezer.com'),           bg: '#A238FF', category: 'Music',            defaultAmount: 9.99  },
  { name: 'Discord Nitro',         logo: icon('discord.com'),          bg: '#5865F2', category: 'Social Media',     defaultAmount: 9.99  },
  { name: 'Discovery+',            logo: icon('discoveryplus.com'),    bg: '#1675FF', category: 'Video Streaming',  defaultAmount: 4.99  },
  { name: 'Disney+',               logo: icon('disneyplus.com'),       bg: '#0C1F6B', category: 'Video Streaming',  defaultAmount: 8.99  },
  { name: 'Dropbox',               logo: icon('dropbox.com'),          bg: '#0061FF', category: 'Cloud Storage',    defaultAmount: 11.99 },
  { name: 'Duolingo Plus',         logo: icon('duolingo.com'),         bg: '#58CC02', category: 'Education',        defaultAmount: 6.99  },
  { name: 'EA Play',               logo: icon('ea.com'),               bg: '#FF4600', category: 'Gaming',           defaultAmount: 4.99  },
  { name: 'ESPN+',                 logo: icon('espn.com'),             bg: '#CC0000', category: 'Entertainment',    defaultAmount: 10.99 },
  { name: 'Evernote',              logo: icon('evernote.com'),         bg: '#00A82D', category: 'Productivity',     defaultAmount: 14.99 },
  { name: 'ExpressVPN',            logo: icon('expressvpn.com'),       bg: '#DA3940', category: 'Software',         defaultAmount: 8.32  },
  { name: 'Figma',                 logo: icon('figma.com'),            bg: '#000000', category: 'Productivity',     defaultAmount: 15.00 },
  { name: 'Freeletics',            logo: icon('freeletics.com'),       bg: '#1A1A1A', category: 'Health & Fitness', defaultAmount: 12.99 },
  { name: 'FuboTV',                logo: icon('fubo.tv'),              bg: '#E8001C', category: 'Video Streaming',  defaultAmount: 74.99 },
  { name: 'GitHub',                logo: icon('github.com'),           bg: '#24292E', category: 'Software',         defaultAmount: 4.00  },
  { name: 'Google One',            logo: icon('one.google.com'),       bg: '#4285F4', category: 'Cloud Storage',    defaultAmount: 1.99  },
  { name: 'Grammarly',             logo: icon('grammarly.com'),        bg: '#15C39A', category: 'Productivity',     defaultAmount: 12.00 },
  { name: 'HBO Max',               logo: icon('max.com'),              bg: '#002BE7', category: 'Video Streaming',  defaultAmount: 13.99 },
  { name: 'Headspace',             logo: icon('headspace.com'),        bg: '#F47D31', category: 'Health & Fitness', defaultAmount: 12.99 },
  { name: 'Hulu',                  logo: icon('hulu.com'),             bg: '#1CE783', category: 'Video Streaming',  defaultAmount: 17.99 },
  { name: 'iCloud+',               logo: icon('icloud.com'),           bg: '#3478F6', category: 'Cloud Storage',    defaultAmount: 2.99  },
  { name: 'Instacart+',            logo: icon('instacart.com'),        bg: '#43B02A', category: 'Food & Delivery',  defaultAmount: 9.99  },
  { name: 'Keeper',                logo: icon('keepersecurity.com'),   bg: '#0080FF', category: 'Software',         defaultAmount: 2.92  },
  { name: 'Linear',                logo: icon('linear.app'),           bg: '#5E6AD2', category: 'Productivity',     defaultAmount: 8.00  },
  { name: 'LinkedIn Learning',     logo: icon('linkedin.com'),         bg: '#0A66C2', category: 'Education',        defaultAmount: 19.99 },
  { name: 'LinkedIn Premium',      logo: icon('linkedin.com'),         bg: '#0A66C2', category: 'Social Media',     defaultAmount: 39.99 },
  { name: 'Loom',                  logo: icon('loom.com'),             bg: '#625DF5', category: 'Productivity',     defaultAmount: 12.50 },
  { name: 'MasterClass',           logo: icon('masterclass.com'),      bg: '#1D1D1D', category: 'Education',        defaultAmount: 10.00 },
  { name: 'Microsoft 365',         logo: icon('microsoft.com'),        bg: '#D83B01', category: 'Productivity',     defaultAmount: 9.99  },
  { name: 'Miro',                  logo: icon('miro.com'),             bg: '#050038', category: 'Productivity',     defaultAmount: 8.00  },
  { name: 'Monarch Money',         logo: icon('monarchmoney.com'),     bg: '#6B42F0', category: 'Finance',          defaultAmount: 14.99 },
  { name: 'Monday.com',            logo: icon('monday.com'),           bg: '#FF3750', category: 'Productivity',     defaultAmount: 9.00  },
  { name: 'MUBI',                  logo: icon('mubi.com'),             bg: '#000000', category: 'Video Streaming',  defaultAmount: 14.99 },
  { name: 'MyFitnessPal',          logo: icon('myfitnesspal.com'),     bg: '#0064F7', category: 'Health & Fitness', defaultAmount: 9.99  },
  { name: 'NBA League Pass',       logo: icon('nba.com'),              bg: '#1D428A', category: 'Entertainment',    defaultAmount: 14.99 },
  { name: 'Netflix',               logo: icon('netflix.com'),          bg: '#000000', category: 'Video Streaming',  defaultAmount: 15.49 },
  { name: 'New York Times',        logo: icon('nytimes.com'),          bg: '#000000', category: 'News & Media',     defaultAmount: 17.00 },
  { name: 'Nike Training Club',    logo: icon('nike.com'),             bg: '#111111', category: 'Health & Fitness', defaultAmount: 14.99 },
  { name: 'Nintendo Online',       logo: icon('nintendo.com'),         bg: '#E4000F', category: 'Gaming',           defaultAmount: 3.99  },
  { name: 'NordVPN',               logo: icon('nordvpn.com'),          bg: '#4687FF', category: 'Software',         defaultAmount: 4.49  },
  { name: 'Noom',                  logo: icon('noom.com'),             bg: '#51B74E', category: 'Health & Fitness', defaultAmount: 59.00 },
  { name: 'Notion',                logo: icon('notion.so'),            bg: '#000000', category: 'Productivity',     defaultAmount: 10.00 },
  { name: 'OneDrive',              logo: icon('onedrive.live.com'),    bg: '#0078D4', category: 'Cloud Storage',    defaultAmount: 2.00  },
  { name: 'Pandora',               logo: icon('pandora.com'),          bg: '#3668FF', category: 'Music',            defaultAmount: 4.99  },
  { name: 'Paramount+',            logo: icon('paramountplus.com'),    bg: '#0064FF', category: 'Video Streaming',  defaultAmount: 5.99  },
  { name: 'Patreon',               logo: icon('patreon.com'),          bg: '#FF424D', category: 'Entertainment',    defaultAmount: 5.00  },
  { name: 'Peacock',               logo: icon('peacocktv.com'),        bg: '#000000', category: 'Video Streaming',  defaultAmount: 5.99  },
  { name: 'Peloton',               logo: icon('onepeloton.com'),       bg: '#000000', category: 'Health & Fitness', defaultAmount: 12.99 },
  { name: 'Philo',                 logo: icon('philo.com'),            bg: '#1A1A2E', category: 'Video Streaming',  defaultAmount: 25.00 },
  { name: 'PlayStation Plus',      logo: icon('playstation.com'),      bg: '#003791', category: 'Gaming',           defaultAmount: 8.99  },
  { name: 'Setapp',                logo: icon('setapp.com'),           bg: '#6C5CE7', category: 'Software',         defaultAmount: 9.99  },
  { name: 'Shudder',               logo: icon('shudder.com'),          bg: '#2B2B2B', category: 'Video Streaming',  defaultAmount: 5.99  },
  { name: 'Skillshare',            logo: icon('skillshare.com'),       bg: '#002333', category: 'Education',        defaultAmount: 8.25  },
  { name: 'Slack',                 logo: icon('slack.com'),            bg: '#4A154B', category: 'Productivity',     defaultAmount: 8.75  },
  { name: 'SoundCloud Go',         logo: icon('soundcloud.com'),       bg: '#FF5500', category: 'Music',            defaultAmount: 9.99  },
  { name: 'Spotify',               logo: icon('spotify.com'),          bg: '#191414', category: 'Music',            defaultAmount: 10.99 },
  { name: 'Strava',                logo: icon('strava.com'),           bg: '#FC4C02', category: 'Health & Fitness', defaultAmount: 11.99 },
  { name: 'Substack',              logo: icon('substack.com'),         bg: '#FF6719', category: 'News & Media',     defaultAmount: 5.00  },
  { name: 'Tailscale',             logo: icon('tailscale.com'),        bg: '#242424', category: 'Software',         defaultAmount: 6.00  },
  { name: 'The Athletic',          logo: icon('theathletic.com'),      bg: '#141414', category: 'News & Media',     defaultAmount: 7.99  },
  { name: 'Tidal',                 logo: icon('tidal.com'),            bg: '#000000', category: 'Music',            defaultAmount: 10.99 },
  { name: 'Todoist',               logo: icon('todoist.com'),          bg: '#DB4035', category: 'Productivity',     defaultAmount: 4.00  },
  { name: 'Trello',                logo: icon('trello.com'),           bg: '#0052CC', category: 'Productivity',     defaultAmount: 5.00  },
  { name: 'Twitch',                logo: icon('twitch.tv'),            bg: '#9146FF', category: 'Entertainment',    defaultAmount: 4.99  },
  { name: 'Uber One',              logo: icon('uber.com'),             bg: '#000000', category: 'Food & Delivery',  defaultAmount: 9.99  },
  { name: 'Ubisoft+',              logo: icon('ubisoft.com'),          bg: '#0070FF', category: 'Gaming',           defaultAmount: 14.99 },
  { name: 'Wall Street Journal',   logo: icon('wsj.com'),              bg: '#004276', category: 'News & Media',     defaultAmount: 24.99 },
  { name: 'Washington Post',       logo: icon('washingtonpost.com'),   bg: '#231F20', category: 'News & Media',     defaultAmount: 9.99  },
  { name: 'WHOOP',                 logo: icon('whoop.com'),            bg: '#00A651', category: 'Health & Fitness', defaultAmount: 30.00 },
  { name: 'WW',                    logo: icon('ww.com'),               bg: '#00AAE4', category: 'Health & Fitness', defaultAmount: 22.95 },
  { name: 'X Premium',             logo: icon('x.com'),                bg: '#000000', category: 'Social Media',     defaultAmount: 8.00  },
  { name: 'Xbox Game Pass',        logo: icon('xbox.com'),             bg: '#107C10', category: 'Gaming',           defaultAmount: 14.99 },
  { name: 'YNAB',                  logo: icon('youneedabudget.com'),   bg: '#5DB13E', category: 'Finance',          defaultAmount: 14.99 },
  { name: 'YouTube Music',         logo: icon('music.youtube.com'),    bg: '#FF0000', category: 'Music',            defaultAmount: 10.99 },
  { name: 'YouTube Premium',       logo: icon('youtube.com'),          bg: '#FF0000', category: 'Video Streaming',  defaultAmount: 13.99 },
  { name: 'Zoom',                  logo: icon('zoom.us'),              bg: '#2D8CFF', category: 'Productivity',     defaultAmount: 14.99 },
] as const;

// Derive brand bg color from service name (for existing saved subscriptions)
export function getServiceBg(name: string): string {
  const match = POPULAR_SERVICES.find(s =>
    name.toLowerCase().includes(s.name.toLowerCase()) ||
    s.name.toLowerCase().includes(name.toLowerCase())
  );
  return match?.bg ?? '#555555';
}

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
