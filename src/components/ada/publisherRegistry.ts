interface PublisherIdentity {
  initials: string;
  color: string;
}

const KNOWN_PUBLISHERS: Record<string, PublisherIdentity> = {
  'reuters': { initials: 'R', color: '#FF8000' },
  'bloomberg': { initials: 'B', color: '#1E1E1E' },
  'financial times': { initials: 'FT', color: '#FCD0B1' },
  'ft': { initials: 'FT', color: '#FCD0B1' },
  'cnbc': { initials: 'C', color: '#005594' },
  'yahoo finance': { initials: 'Y', color: '#6001D2' },
  'marketwatch': { initials: 'MW', color: '#0D5E21' },
  'gulf news': { initials: 'GN', color: '#B71C1C' },
  'the national': { initials: 'TN', color: '#1A237E' },
  'arab news': { initials: 'AN', color: '#00695C' },
  'wall street journal': { initials: 'WSJ', color: '#111111' },
  'wsj': { initials: 'WSJ', color: '#111111' },
  'the economist': { initials: 'TE', color: '#E3120B' },
  'barrons': { initials: 'B', color: '#006B3F' },
  "barron's": { initials: 'B', color: '#006B3F' },
  'morningstar': { initials: 'MS', color: '#E65100' },
  'investing.com': { initials: 'IC', color: '#0B6623' },
  'seekingalpha': { initials: 'SA', color: '#F57C00' },
  'seeking alpha': { initials: 'SA', color: '#F57C00' },
  'cnn': { initials: 'CNN', color: '#CC0000' },
  'cnn business': { initials: 'CNN', color: '#CC0000' },
  'forbes': { initials: 'F', color: '#1B3044' },
  'al jazeera': { initials: 'AJ', color: '#C5A55A' },
  'khaleej times': { initials: 'KT', color: '#1A237E' },
  'zawya': { initials: 'Z', color: '#0277BD' },
  'the motley fool': { initials: 'MF', color: '#2E5AAC' },
  'fortune': { initials: 'F', color: '#E42B2B' },
  'business insider': { initials: 'BI', color: '#004B93' },
  'insider': { initials: 'BI', color: '#004B93' },
  'benzinga': { initials: 'BZ', color: '#0D47A1' },
  'accesswire': { initials: 'AW', color: '#1565C0' },
  'globenewswire': { initials: 'GW', color: '#2E7D32' },
  'pr newswire': { initials: 'PR', color: '#283593' },
};

const FALLBACK_COLORS = [
  '#5C6BC0', '#26A69A', '#8D6E63', '#78909C', '#7E57C2',
  '#42A5F5', '#66BB6A', '#FFA726', '#EC407A', '#AB47BC',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export function getPublisherIdentity(publisher: string): PublisherIdentity {
  const key = publisher.toLowerCase().trim();
  const known = KNOWN_PUBLISHERS[key];
  if (known) return known;

  return {
    initials: getInitials(publisher),
    color: FALLBACK_COLORS[hashString(key) % FALLBACK_COLORS.length],
  };
}
