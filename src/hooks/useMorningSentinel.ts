import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './api';
import type { MorningSentinelResponse } from '../types';

const SENTINEL_KEY = ['morning-sentinel'];
const STALE_TIME = 4 * 60 * 60 * 1000;

interface StreamingState {
  isStreaming: boolean;
  metrics: Partial<MorningSentinelResponse> | null;
  rawText: string;
  parsedData: MorningSentinelResponse | null;
}

async function consumeSentinelStream(
  url: string,
  onMetrics: (m: Partial<MorningSentinelResponse>) => void,
  onText: (chunk: string) => void,
  onComplete: (data: MorningSentinelResponse) => void,
  abortSignal?: AbortSignal,
) {
  const res = await fetch(url, { signal: abortSignal });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.type === 'metrics') onMetrics(event.data);
        else if (event.type === 'text') onText(event.data);
        else if (event.type === 'complete') onComplete(event.data);
      } catch {}
    }
  }
}

export function useMorningSentinel() {
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  const [streaming, setStreaming] = useState<StreamingState>({
    isStreaming: false,
    metrics: null,
    rawText: '',
    parsedData: null,
  });

  const query = useQuery({
    queryKey: SENTINEL_KEY,
    queryFn: () => apiFetch<MorningSentinelResponse>('/api/morning-sentinel'),
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const startStream = useCallback((refresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStreaming({ isStreaming: true, metrics: null, rawText: '', parsedData: null });

    const url = refresh ? '/api/morning-sentinel/stream?refresh=true' : '/api/morning-sentinel/stream';

    consumeSentinelStream(
      url,
      (metrics) => setStreaming(s => ({ ...s, metrics })),
      (chunk) => setStreaming(s => ({ ...s, rawText: s.rawText + chunk })),
      (data) => {
        setStreaming({ isStreaming: false, metrics: null, rawText: '', parsedData: data });
        queryClient.setQueryData(SENTINEL_KEY, data);
      },
      controller.signal,
    ).catch((err) => {
      if (err.name !== 'AbortError') {
        console.error('Sentinel stream error:', err);
        setStreaming(s => ({ ...s, isStreaming: false }));
      }
    });
  }, [queryClient]);

  useEffect(() => {
    if (!query.data && !query.isLoading && !streaming.isStreaming && !streaming.parsedData) {
      startStream();
    }
    return undefined;
  }, [query.data, query.isLoading, streaming.isStreaming, streaming.parsedData, startStream]);

  const forceRefresh = useCallback(async () => {
    queryClient.removeQueries({ queryKey: SENTINEL_KEY });
    startStream(true);
  }, [queryClient, startStream]);

  const hasData = !!query.data || !!streaming.parsedData;
  const finalData = query.data || streaming.parsedData;

  return {
    data: finalData,
    isLoading: query.isLoading && !streaming.isStreaming && !streaming.parsedData,
    isError: query.isError && !streaming.isStreaming && !streaming.parsedData,
    isStreaming: streaming.isStreaming,
    streamingMetrics: streaming.metrics,
    streamingText: streaming.rawText,
    refetch: query.refetch,
    forceRefresh,
    hasData,
  };
}
