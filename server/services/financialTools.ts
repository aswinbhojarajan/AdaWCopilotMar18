import type OpenAI from 'openai';
import type { ProviderRegistry } from '../providers/types';
import type { ToolResult } from '../../shared/schemas/agent';
import type { ToolGroup } from './modelRouter';
import {
  getToolGroupForName,
  filterToolNamesByGroups as registryFilterGroups,
  getToolDefinitions as registryGetDefs,
  getAllToolDefinitions,
  isFinancialTool as registryIsFinancial,
  isUiTool as registryIsUi,
  executeTool,
} from './toolRegistry';

export function getToolGroup(toolName: string): ToolGroup | undefined {
  return getToolGroupForName(toolName);
}

export function filterToolNamesByGroups(
  toolNames: string[],
  allowedGroups: ToolGroup[],
): string[] {
  return registryFilterGroups(toolNames, allowedGroups);
}

export const FINANCIAL_TOOL_DEFINITIONS: OpenAI.ChatCompletionTool[] = getAllToolDefinitions().filter(t => {
  const name = t.type === 'function' ? t.function.name : '';
  return registryIsFinancial(name);
});

export const UI_TOOL_DEFINITIONS: OpenAI.ChatCompletionTool[] = getAllToolDefinitions().filter(t => {
  const name = t.type === 'function' ? t.function.name : '';
  return registryIsUi(name);
});

export function getToolDefinitions(allowedToolNames: string[]): OpenAI.ChatCompletionTool[] {
  return registryGetDefs(allowedToolNames);
}

export function isFinancialTool(name: string): boolean {
  return registryIsFinancial(name);
}

export function isUiTool(name: string): boolean {
  return registryIsUi(name);
}

export async function executeFinancialTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string,
  registry: ProviderRegistry,
  riskLevel: string,
): Promise<ToolResult> {
  return executeTool(toolName, args, userId, registry, riskLevel);
}
