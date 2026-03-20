import type { PortfolioProvider } from '../types';
import type { ToolResult } from '../../../shared/schemas/agent';
import { toolOk, toolError } from './helpers';
import * as portfolioRepo from '../../repositories/portfolioRepository';

export const mockPortfolioProvider: PortfolioProvider = {
  name: 'mock',

  async getPortfolioSnapshot(userId: string): Promise<ToolResult> {
    const start = Date.now();
    try {
      const snapshot = await portfolioRepo.getLatestSnapshot(userId);
      return toolOk('mock_portfolio', 'portfolio_api', snapshot, start);
    } catch (error) {
      return toolError('mock_portfolio', 'portfolio_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getHoldings(userId: string): Promise<ToolResult> {
    const start = Date.now();
    try {
      const holdings = await portfolioRepo.getEnrichedHoldingsByUserId(userId);
      return toolOk('mock_portfolio', 'portfolio_api', holdings, start);
    } catch (error) {
      return toolError('mock_portfolio', 'portfolio_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getAllocations(userId: string): Promise<ToolResult> {
    const start = Date.now();
    try {
      const allocations = await portfolioRepo.getAllocationsByUserId(userId);
      return toolOk('mock_portfolio', 'portfolio_api', allocations, start);
    } catch (error) {
      return toolError('mock_portfolio', 'portfolio_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getPerformance(userId: string, days: number): Promise<ToolResult> {
    const start = Date.now();
    try {
      const history = await portfolioRepo.getPerformanceHistory(userId, days);
      return toolOk('mock_portfolio', 'portfolio_api', history, start);
    } catch (error) {
      return toolError('mock_portfolio', 'portfolio_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },
};
