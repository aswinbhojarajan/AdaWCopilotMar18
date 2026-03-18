import type { PollResults, PeerComparison } from '../types';

export interface PollOptionData {
  value: string;
  label: string;
}

export const pollOptions: PollOptionData[] = [
  { value: 'north-america', label: 'North America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia-pacific', label: 'Asia Pacific' },
  { value: 'emerging-markets', label: 'Emerging Markets' },
  { value: 'global-diversified', label: 'Global/Diversified' },
];

export const pollResults: PollResults = {
  'north-america': 32,
  europe: 18,
  'asia-pacific': 24,
  'emerging-markets': 12,
  'global-diversified': 14,
};

export const peerComparisons: PeerComparison[] = [
  { assetClass: 'Stocks', userPercent: 55, peerPercent: 45, color: '#d9b3b5' },
  { assetClass: 'Crypto', userPercent: 6, peerPercent: 8, color: '#a87174' },
  { assetClass: 'Bonds', userPercent: 15, peerPercent: 22, color: '#6d3f42' },
  { assetClass: 'Cash', userPercent: 20, peerPercent: 15, color: '#441316' },
  { assetClass: 'Commodities', userPercent: 4, peerPercent: 10, color: '#8b5a5e' },
];
