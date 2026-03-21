import { describe, it, expect } from 'vitest';

const API_BASE = 'http://localhost:3001/api';

const PERSONAS = [
  { id: 'user-abdullah', name: 'Abdullah', riskProfile: 'moderate', expectedMinHoldings: 3, hasGoals: true },
  { id: 'user-fatima', name: 'Fatima', riskProfile: 'conservative', expectedMinHoldings: 3, hasGoals: true },
  { id: 'user-omar', name: 'Omar', riskProfile: 'aggressive', expectedMinHoldings: 3, hasGoals: true },
  { id: 'user-layla', name: 'Layla', riskProfile: 'moderate', expectedMinHoldings: 3, hasGoals: true },
  { id: 'user-khalid', name: 'Khalid', riskProfile: 'conservative', expectedMinHoldings: 2, hasGoals: true },
  { id: 'user-sara', name: 'Sara', riskProfile: 'moderate', expectedMinHoldings: 2, hasGoals: true },
  { id: 'user-raj', name: 'Raj', riskProfile: 'aggressive', expectedMinHoldings: 2, hasGoals: false },
  { id: 'user-nadia', name: 'Nadia', riskProfile: 'moderate', expectedMinHoldings: 2, hasGoals: false },
];

function apiFetch(path: string, userId: string) {
  return fetch(`${API_BASE}${path}`, { headers: { 'X-User-ID': userId } }).then(r => r.json());
}

describe('Persona Data Parity', () => {
  describe.each(PERSONAS)('$name ($id)', (persona) => {
    it('has a wealth overview with positive totalValue and performance data', async () => {
      const overview = await apiFetch('/wealth/overview', persona.id);
      expect(overview.totalValue).toBeGreaterThan(0);
      expect(overview.performanceData).toBeDefined();
      expect(Object.keys(overview.performanceData).length).toBeGreaterThanOrEqual(1);
      const oneYearData = overview.performanceData['1Y'];
      if (oneYearData) {
        expect(oneYearData.length).toBeGreaterThanOrEqual(2);
        const values = oneYearData.map((p: { value: number }) => p.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        expect(max - min).toBeGreaterThan(0);
      }
    });

    it('has allocations that reconcile with snapshot total', async () => {
      const overview = await apiFetch('/wealth/overview', persona.id);
      const allocations = await apiFetch('/wealth/allocation', persona.id);
      expect(allocations.length).toBeGreaterThanOrEqual(1);
      const allocTotal = allocations.reduce((s: number, a: { amount: number }) => s + a.amount, 0);
      expect(Math.abs(allocTotal - overview.totalValue)).toBeLessThan(1);
    });

    it('has holdings with at least the expected minimum', async () => {
      const holdings = await apiFetch('/wealth/holdings', persona.id);
      expect(holdings.length).toBeGreaterThanOrEqual(persona.expectedMinHoldings);
    });

    it('has wealth insights with primary text and advisor', async () => {
      const overview = await apiFetch('/wealth/overview', persona.id);
      expect(overview.insights).toBeDefined();
      expect(overview.insights.primaryInsight).toBeTruthy();
      expect(overview.insights.advisorName).toBeTruthy();
    });

    it('has alerts', async () => {
      const alerts = await apiFetch('/notifications', persona.id);
      expect(alerts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Discover content', () => {
    it('returns forYou content for all users', async () => {
      for (const persona of PERSONAS) {
        const content = await apiFetch('/content/discover?tab=forYou', persona.id);
        expect(content.length).toBeGreaterThanOrEqual(1);
      }
    });
  });
});
