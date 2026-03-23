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
  // Video Streaming
  { name: 'Netflix',          logo: icon('netflix.com'),         bg: '#000000', category: 'Video Streaming',  defaultAmount: 15.49 },
  { name: 'YouTube Premium',  logo: icon('youtube.com'),         bg: '#FF0000', category: 'Video Streaming',  defaultAmount: 13.99 },
  { name: 'Disney+',          logo: icon('disneyplus.com'),      bg: '#0C1F6B', category: 'Video Streaming',  defaultAmount: 8.99  },
  { name: 'HBO Max',          logo: icon('max.com'),             bg: '#002BE7', category: 'Video Streaming',  defaultAmount: 13.99 },
  { name: 'Apple TV+',        logo: icon('tv.apple.com'),        bg: '#000000', category: 'Video Streaming',  defaultAmount: 8.99  },
  { name: 'Hulu',             logo: icon('hulu.com'),            bg: '#1CE783', category: 'Video Streaming',  defaultAmount: 17.99 },
  { name: 'Amazon Prime',     logo: icon('primevideo.com'),      bg: '#00A8E1', category: 'Video Streaming',  defaultAmount: 8.99  },
  { name: 'Peacock',          logo: icon('peacocktv.com'),       bg: '#000000', category: 'Video Streaming',  defaultAmount: 5.99  },
  { name: 'Paramount+',       logo: icon('paramountplus.com'),   bg: '#0064FF', category: 'Video Streaming',  defaultAmount: 5.99  },
  { name: 'Crunchyroll',      logo: icon('crunchyroll.com'),     bg: '#F47521', category: 'Video Streaming',  defaultAmount: 7.99  },
  // Music
  { name: 'Spotify',          logo: icon('spotify.com'),         bg: '#191414', category: 'Music',            defaultAmount: 10.99 },
  { name: 'Apple Music',      logo: icon('music.apple.com'),     bg: '#FC3C44', category: 'Music',            defaultAmount: 10.99 },
  { name: 'Tidal',            logo: icon('tidal.com'),           bg: '#000000', category: 'Music',            defaultAmount: 10.99 },
  { name: 'Deezer',           logo: icon('deezer.com'),          bg: '#A238FF', category: 'Music',            defaultAmount: 9.99  },
  { name: 'SoundCloud Go',    logo: icon('soundcloud.com'),      bg: '#FF5500', category: 'Music',            defaultAmount: 9.99  },
  // Cloud Storage
  { name: 'iCloud+',          logo: icon('icloud.com'),          bg: '#3478F6', category: 'Cloud Storage',    defaultAmount: 2.99  },
  { name: 'Google One',       logo: icon('one.google.com'),      bg: '#4285F4', category: 'Cloud Storage',    defaultAmount: 1.99  },
  { name: 'Dropbox',          logo: icon('dropbox.com'),         bg: '#0061FF', category: 'Cloud Storage',    defaultAmount: 11.99 },
  { name: 'OneDrive',         logo: icon('onedrive.live.com'),   bg: '#0078D4', category: 'Cloud Storage',    defaultAmount: 2.00  },
  // Productivity
  { name: 'Microsoft 365',    logo: icon('microsoft.com'),       bg: '#D83B01', category: 'Productivity',     defaultAmount: 9.99  },
  { name: 'Notion',           logo: icon('notion.so'),           bg: '#000000', category: 'Productivity',     defaultAmount: 10.00 },
  { name: 'Slack',            logo: icon('slack.com'),           bg: '#4A154B', category: 'Productivity',     defaultAmount: 8.75  },
  { name: 'Zoom',             logo: icon('zoom.us'),             bg: '#2D8CFF', category: 'Productivity',     defaultAmount: 14.99 },
  { name: 'Figma',            logo: icon('figma.com'),           bg: '#000000', category: 'Productivity',     defaultAmount: 15.00 },
  { name: 'Grammarly',        logo: icon('grammarly.com'),       bg: '#15C39A', category: 'Productivity',     defaultAmount: 12.00 },
  { name: 'Canva Pro',        logo: icon('canva.com'),           bg: '#7D2AE8', category: 'Productivity',     defaultAmount: 12.99 },
  { name: 'Evernote',         logo: icon('evernote.com'),        bg: '#00A82D', category: 'Productivity',     defaultAmount: 14.99 },
  { name: 'Trello',           logo: icon('trello.com'),          bg: '#0052CC', category: 'Productivity',     defaultAmount: 5.00  },
  // Software & Tools
  { name: 'Adobe Creative Cloud', logo: icon('adobe.com'),       bg: '#FF0000', category: 'Software',         defaultAmount: 54.99 },
  { name: 'GitHub',           logo: icon('github.com'),          bg: '#24292E', category: 'Software',         defaultAmount: 4.00  },
  { name: 'ChatGPT Plus',     logo: icon('openai.com'),          bg: '#10A37F', category: 'Software',         defaultAmount: 20.00 },
  { name: '1Password',        logo: icon('1password.com'),       bg: '#1A8CFF', category: 'Software',         defaultAmount: 3.99  },
  { name: 'NordVPN',          logo: icon('nordvpn.com'),         bg: '#4687FF', category: 'Software',         defaultAmount: 4.49  },
  { name: 'ExpressVPN',       logo: icon('expressvpn.com'),      bg: '#DA3940', category: 'Software',         defaultAmount: 8.32  },
  { name: 'Dashlane',         logo: icon('dashlane.com'),        bg: '#0A223A', category: 'Software',         defaultAmount: 4.99  },
  // Education
  { name: 'Duolingo Plus',    logo: icon('duolingo.com'),        bg: '#58CC02', category: 'Education',        defaultAmount: 6.99  },
  { name: 'Coursera',         logo: icon('coursera.org'),        bg: '#0056D2', category: 'Education',        defaultAmount: 59.00 },
  { name: 'MasterClass',      logo: icon('masterclass.com'),     bg: '#1D1D1D', category: 'Education',        defaultAmount: 10.00 },
  { name: 'Skillshare',       logo: icon('skillshare.com'),      bg: '#002333', category: 'Education',        defaultAmount: 8.25  },
  { name: 'Audible',          logo: icon('audible.com'),         bg: '#FF9900', category: 'Education',        defaultAmount: 14.95 },
  // Health & Fitness
  { name: 'Headspace',        logo: icon('headspace.com'),       bg: '#F47D31', category: 'Health & Fitness', defaultAmount: 12.99 },
  { name: 'Calm',             logo: icon('calm.com'),            bg: '#4A4A8A', category: 'Health & Fitness', defaultAmount: 14.99 },
  { name: 'Strava',           logo: icon('strava.com'),          bg: '#FC4C02', category: 'Health & Fitness', defaultAmount: 11.99 },
  { name: 'MyFitnessPal',     logo: icon('myfitnesspal.com'),    bg: '#0064F7', category: 'Health & Fitness', defaultAmount: 9.99  },
  { name: 'Peloton',          logo: icon('onepeloton.com'),      bg: '#000000', category: 'Health & Fitness', defaultAmount: 12.99 },
  // Gaming
  { name: 'Xbox Game Pass',   logo: icon('xbox.com'),            bg: '#107C10', category: 'Gaming',           defaultAmount: 14.99 },
  { name: 'PlayStation Plus', logo: icon('playstation.com'),     bg: '#003791', category: 'Gaming',           defaultAmount: 8.99  },
  { name: 'Nintendo Online',  logo: icon('nintendo.com'),        bg: '#E4000F', category: 'Gaming',           defaultAmount: 3.99  },
  // Social & Comms
  { name: 'LinkedIn Premium', logo: icon('linkedin.com'),        bg: '#0A66C2', category: 'Social Media',     defaultAmount: 39.99 },
  { name: 'Discord Nitro',    logo: icon('discord.com'),         bg: '#5865F2', category: 'Social Media',     defaultAmount: 9.99  },
  { name: 'Twitch',           logo: icon('twitch.tv'),           bg: '#9146FF', category: 'Entertainment',    defaultAmount: 4.99  },
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
