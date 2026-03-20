import type { PortfolioProvider } from '../types';
import type { ToolResult } from '../../../shared/schemas/agent';
import * as portfolioRepo from '../../repositories/portfolioRepository';

export const mockPortfolioProvider: PortfolioProvider = {
  name: 'mock',

  async getPositions(userId: string): Promise<ToolResult> {
    const start = Date.now();
    try {
      const holdings = await portfolioRepo.getHoldingsByUserId(userId);
      return {
        tool_name: 'get_positions',
        success: true,
        data: holdings,
        source_provider: 'mock',
        as_of: new Date().toISOString(),
        latency_ms: Date.now() - start,
      };
    } catch (error) {
      return {
        tool_name: 'get_positions',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source_provider: 'mock',
        as_of: new Date().toISOString(),
        latency_ms: Date.now() - start,
      };
    }
  },

  async getAllocations(userId: string): Promise<ToolResult> {
    const start = Date.now();
    try {
      const allocations = await portfolioRepo.getAllocationsByUserId(userId);
      return {
        tool_name: 'get_allocations',
        success: true,
        data: allocations,
        source_provider: 'mock',
        as_of: new Date().toISOString(),
        latency_ms: Date.now() - start,
      };
    } catch (error) {
      return {
        tool_name: 'get_allocations',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source_provider: 'mock',
        as_of: new Date().toISOString(),
        latency_ms: Date.now() - start,
      };
    }
  },

  async getSnapshot(userId: string): Promise<ToolResult> {
    const start = Date.now();
    try {
      const snapshot = await portfolioRepo.getLatestSnapshot(userId);
      return {
        tool_name: 'get_portfolio_snapshot',
        success: true,
        data: snapshot,
        source_provider: 'mock',
        as_of: new Date().toISOString(),
        latency_ms: Date.now() - start,
      };
    } catch (error) {
      return {
        tool_name: 'get_portfolio_snapshot',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source_provider: 'mock',
        as_of: new Date().toISOString(),
        latency_ms: Date.now() - start,
      };
    }
  },

  async getPerformance(userId: string, days: number): Promise<ToolResult> {
    const start = Date.now();
    try {
      const history = await portfolioRepo.getPerformanceHistory(userId, days);
      return {
        tool_name: 'get_performance',
        success: true,
        data: history,
        source_provider: 'mock',
        as_of: new Date().toISOString(),
        latency_ms: Date.now() - start,
      };
    } catch (error) {
      return {
        tool_name: 'get_performance',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        source_provider: 'mock',
        as_of: new Date().toISOString(),
        latency_ms: Date.now() - start,
      };
    }
  },
};
