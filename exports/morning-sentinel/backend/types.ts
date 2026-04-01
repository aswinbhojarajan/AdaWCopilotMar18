export interface MorningSentinelRisk {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

export interface MorningSentinelAction {
  title: string;
  description: string;
  ctaText: string;
  ctaMessage: string;
}

export interface MorningSentinelKeyMover {
  symbol: string;
  name: string;
  direction: 'up' | 'down';
  detail: string;
}

export interface MorningSentinelResponse {
  userName: string;
  generatedAt: string;
  portfolioValue: number;
  dailyChangeAmount: number;
  dailyChangePercent: number;
  headline: string;
  overview: string;
  keyMovers: MorningSentinelKeyMover[];
  risks: MorningSentinelRisk[];
  actions: MorningSentinelAction[];
  benchmarkNote: string;
  hasAnomalies: boolean;
}
