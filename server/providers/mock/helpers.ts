import type { ToolResult } from '../../../shared/schemas/agent';

export function toolOk(sourceName: string, sourceType: string, data: unknown, startMs: number, warnings?: string[]): ToolResult {
  return {
    status: 'ok',
    source_name: sourceName,
    source_type: sourceType,
    as_of: new Date().toISOString(),
    latency_ms: Date.now() - startMs,
    data,
    ...(warnings && warnings.length > 0 ? { warnings } : {}),
  };
}

export function toolError(sourceName: string, sourceType: string, error: string, startMs: number): ToolResult {
  return {
    status: 'error',
    source_name: sourceName,
    source_type: sourceType,
    as_of: new Date().toISOString(),
    latency_ms: Date.now() - startMs,
    data: null,
    error,
  };
}
