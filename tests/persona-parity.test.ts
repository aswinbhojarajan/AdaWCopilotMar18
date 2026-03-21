import { describe, it, expect } from 'vitest';

const API_BASE = 'http://localhost:3001/api';

const PERSONAS = [
  { id: 'user-abdullah', name: 'Abdullah', riskProfile: 'moderate', expectedMinHoldings: 3, hasGoals: true, minGoals: 2 },
  { id: 'user-fatima', name: 'Fatima', riskProfile: 'conservative', expectedMinHoldings: 3, hasGoals: true, minGoals: 1 },
  { id: 'user-omar', name: 'Omar', riskProfile: 'aggressive', expectedMinHoldings: 3, hasGoals: true, minGoals: 2 },
  { id: 'user-layla', name: 'Layla', riskProfile: 'moderate', expectedMinHoldings: 3, hasGoals: true, minGoals: 2 },
  { id: 'user-khalid', name: 'Khalid', riskProfile: 'conservative', expectedMinHoldings: 2, hasGoals: true, minGoals: 1 },
  { id: 'user-sara', name: 'Sara', riskProfile: 'moderate', expectedMinHoldings: 2, hasGoals: true, minGoals: 1 },
  { id: 'user-raj', name: 'Raj', riskProfile: 'aggressive', expectedMinHoldings: 2, hasGoals: false, minGoals: 0 },
  { id: 'user-nadia', name: 'Nadia', riskProfile: 'moderate', expectedMinHoldings: 2, hasGoals: false, minGoals: 0 },
];

function apiFetch(path: string, userId: string) {
  return fetch(`${API_BASE}${path}`, { headers: { 'X-User-ID': userId } }).then(r => r.json());
}

describe('Persona Data Parity', () => {
  describe.each(PERSONAS)('$name ($id)', (persona) => {
    it('has a wealth overview with positive totalValue and non-linear performance data', async () => {
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
      expect(typeof overview.insights.primaryInsight).toBe('string');
      expect(overview.insights.advisorName).toBeTruthy();
      expect(overview.insights.diversificationScore).toBeGreaterThan(0);
      expect(overview.insights.riskLevel).toBeTruthy();
    });

    it('has alerts/notifications', async () => {
      const alerts = await apiFetch('/notifications', persona.id);
      expect(alerts.length).toBeGreaterThanOrEqual(1);
    });

    it('has chat threads with messages', async () => {
      const threads = await apiFetch('/chat/threads', persona.id);
      expect(threads.length).toBeGreaterThanOrEqual(1);
      const firstThread = threads[0];
      expect(firstThread.id).toBeTruthy();
      const messages = await apiFetch(`/chat/${firstThread.id}/messages`, persona.id);
      expect(messages.length).toBeGreaterThanOrEqual(1);
    });

    if (persona.hasGoals) {
      it('has goals', async () => {
        const goals = await apiFetch('/wealth/goals', persona.id);
        expect(goals.length).toBeGreaterThanOrEqual(persona.minGoals);
      });

      it('has a goal health score', async () => {
        const scoreData = await apiFetch('/wealth/goals/health-score', persona.id);
        expect(scoreData.score).toBeGreaterThanOrEqual(0);
        expect(scoreData.score).toBeLessThanOrEqual(100);
      });
    }
  });

  describe('Discover content', () => {
    it('returns forYou content for all users', async () => {
      for (const persona of PERSONAS) {
        const content = await apiFetch('/content/discover?tab=forYou', persona.id);
        expect(content.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Home screen data', () => {
    it('all 8 personas exist in users list with names', async () => {
      const users = await apiFetch('/users', PERSONAS[0].id);
      expect(users.length).toBe(8);
      for (const persona of PERSONAS) {
        const found = users.find((u: { id: string }) => u.id === persona.id);
        expect(found).toBeDefined();
        expect(found.firstName).toBeTruthy();
        expect(found.portfolioValue).toBeGreaterThan(0);
      }
    });
  });
});
