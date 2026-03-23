import { describe, it, expect } from 'vitest';

const API_BASE = 'http://localhost:3001/api';

const PERSONAS = [
  { id: 'user-aisha', name: 'Aisha', riskProfile: 'moderate', expectedMinHoldings: 5, hasGoals: true, minGoals: 2, minAlerts: 3 },
  { id: 'user-khalid', name: 'Khalid', riskProfile: 'conservative', expectedMinHoldings: 3, hasGoals: true, minGoals: 1, minAlerts: 3 },
  { id: 'user-raj', name: 'Raj', riskProfile: 'aggressive', expectedMinHoldings: 3, hasGoals: true, minGoals: 1, minAlerts: 3 },
];

function apiFetch(path: string, userId: string) {
  return fetch(`${API_BASE}${path}`, { headers: { 'X-User-ID': userId } }).then(r => r.json());
}

describe('Persona Data Parity', () => {
  describe.each(PERSONAS)('$name ($id)', (persona) => {
    it('has home summary with personalized greeting and content cards', async () => {
      const summary = await apiFetch('/home/summary', persona.id);
      expect(summary.greeting).toContain(persona.name);
      expect(summary.portfolioValue).toBeGreaterThan(0);
      expect(summary.attentionCount).toBeGreaterThanOrEqual(0);
      expect(summary.contentCards.length).toBeGreaterThanOrEqual(1);
      expect(summary.sparklineData.length).toBeGreaterThanOrEqual(2);
    });

    it('has a wealth overview with positive totalValue and non-linear performance data', async () => {
      const overview = await apiFetch('/wealth/overview', persona.id);
      expect(overview.totalValue).toBeGreaterThan(0);
      expect(overview.performanceData).toBeDefined();
      const ranges = Object.keys(overview.performanceData);
      expect(ranges.length).toBeGreaterThanOrEqual(3);
      const oneYearData = overview.performanceData['1Y'];
      expect(oneYearData).toBeDefined();
      expect(oneYearData.length).toBeGreaterThanOrEqual(2);
      const values = oneYearData.map((p: { value: number }) => p.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      expect(max - min).toBeGreaterThan(0);
    });

    it('has allocations that reconcile with snapshot total', async () => {
      const overview = await apiFetch('/wealth/overview', persona.id);
      const allocations = await apiFetch('/wealth/allocation', persona.id);
      expect(allocations.length).toBeGreaterThanOrEqual(2);
      const allocTotal = allocations.reduce((s: number, a: { amount: number }) => s + a.amount, 0);
      expect(Math.abs(allocTotal - overview.totalValue)).toBeLessThan(1);
      const percentages = allocations.map((a: { percentage: number }) => a.percentage);
      const totalPct = percentages.reduce((s: number, p: number) => s + p, 0);
      expect(totalPct).toBeGreaterThanOrEqual(99);
      expect(totalPct).toBeLessThanOrEqual(101);
    });

    it('has holdings with at least the expected minimum', async () => {
      const holdings = await apiFetch('/wealth/holdings', persona.id);
      expect(holdings.length).toBeGreaterThanOrEqual(persona.expectedMinHoldings);
      for (const h of holdings) {
        expect(h.symbol).toBeTruthy();
        expect(h.name).toBeTruthy();
      }
    });

    it('has wealth insights with primary text and advisor', async () => {
      const overview = await apiFetch('/wealth/overview', persona.id);
      expect(overview.insights).toBeDefined();
      expect(overview.insights.primaryInsight).toBeTruthy();
      expect(typeof overview.insights.primaryInsight).toBe('string');
      expect(overview.insights.primaryInsight.length).toBeGreaterThan(10);
      expect(overview.insights.advisorName).toBeTruthy();
      expect(overview.insights.diversificationScore).toBeGreaterThan(0);
      expect(overview.insights.diversificationScore).toBeLessThanOrEqual(100);
      expect(overview.insights.riskLevel).toBeTruthy();
      expect(overview.insights.topAllocationClass).toBeTruthy();
      expect(overview.insights.topAllocationPercent).toBeGreaterThan(0);
    });

    it('has at least 3 alerts/notifications', async () => {
      const alerts = await apiFetch('/notifications', persona.id);
      expect(alerts.length).toBeGreaterThanOrEqual(persona.minAlerts);
    });

    it('has chat threads with messages', async () => {
      const threads = await apiFetch('/chat/threads', persona.id);
      expect(threads.length).toBeGreaterThanOrEqual(2);
      const firstThread = threads[0];
      expect(firstThread.id).toBeTruthy();
      expect(firstThread.title).toBeTruthy();
      const messages = await apiFetch(`/chat/${firstThread.id}/messages`, persona.id);
      expect(messages.length).toBeGreaterThanOrEqual(1);
    });

    if (persona.hasGoals) {
      it('has goals', async () => {
        const goals = await apiFetch('/wealth/goals', persona.id);
        expect(goals.length).toBeGreaterThanOrEqual(persona.minGoals);
        for (const g of goals) {
          expect(g.title).toBeTruthy();
          expect(g.targetAmount).toBeGreaterThan(0);
        }
      });

      it('has a goal health score between 0 and 100', async () => {
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
        expect(content.length).toBeGreaterThanOrEqual(4);
      }
    });
  });

  describe('Home screen data', () => {
    it('all 3 personas exist in users list with names', async () => {
      const users = await apiFetch('/users', PERSONAS[0].id);
      expect(users.length).toBe(3);
      for (const persona of PERSONAS) {
        const found = users.find((u: { id: string }) => u.id === persona.id);
        expect(found).toBeDefined();
        expect(found.firstName).toBeTruthy();
        expect(found.portfolioValue).toBeGreaterThan(0);
      }
    });
  });
});
