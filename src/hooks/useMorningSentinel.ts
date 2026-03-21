import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, getStreamHeaders } from './api';
import type { MorningSentinelResponse } from '../types';

const SENTINEL_KEY = ['morning-sentinel'];
const CACHE_TTL = 4 * 60 * 60 * 1000;
const STREAM_FALLBACK_DELAY_MS = 500;

interface StreamingState {
  isStreaming: boolean;
  metrics: Partial<MorningSentinelResponse> | null;
  rawText: string;
}

async function consumeSentinelStream(
  url: string,
  onMetrics: (m: Partial<MorningSentinelResponse>) => void,
  onText: (chunk: string) => void,
  onComplete: (data: MorningSentinelResponse) => void,
  abortSignal?: AbortSignal,
) {
  const res = await fetch(url, { signal: abortSignal, headers: getStreamHeaders() });
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
  const streamStartedRef = useRef(false);

  const [streaming, setStreaming] = useState<StreamingState>({
    isStreaming: false,
    metrics: null,
    rawText: '',
  });

  const query = useQuery({
    queryKey: SENTINEL_KEY,
    queryFn: () => apiFetch<MorningSentinelResponse>('/api/morning-sentinel'),
    staleTime: CACHE_TTL,
    gcTime: CACHE_TTL,
    refetchOnWindowFocus: false,
    enabled: !streamStartedRef.current,
  });

  const startStream = useCallback((refresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    streamStartedRef.current = true;

    setStreaming({ isStreaming: true, metrics: null, rawText: '' });

    const url = refresh ? '/api/morning-sentinel/stream?refresh=true' : '/api/morning-sentinel/stream';

    consumeSentinelStream(
      url,
      (metrics) => setStreaming(s => ({ ...s, metrics })),
      (chunk) => setStreaming(s => ({ ...s, rawText: s.rawText + chunk })),
      (completedData) => {
        setStreaming({ isStreaming: false, metrics: null, rawText: '' });
        queryClient.setQueryData(SENTINEL_KEY, completedData);
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
    if (query.data || streaming.isStreaming || streamStartedRef.current) return undefined;

    const queryState = queryClient.getQueryState(SENTINEL_KEY);
    const isPrefetching = queryState?.fetchStatus === 'fetching';

    if (!isPrefetching) {
      startStream();
      return undefined;
    }

    const timer = setTimeout(() => {
      if (queryClient.getQueryData(SENTINEL_KEY)) return;
      startStream();
    }, STREAM_FALLBACK_DELAY_MS);

    return () => clearTimeout(timer);
  }, [query.data, query.fetchStatus, streaming.isStreaming, queryClient, startStream]);

  useEffect(() => {
    if (query.data && streaming.isStreaming) {
      abortRef.current?.abort();
      setStreaming({ isStreaming: false, metrics: null, rawText: '' });
    }
    return undefined;
  }, [query.data, streaming.isStreaming]);

  const forceRefresh = useCallback(async () => {
    queryClient.removeQueries({ queryKey: SENTINEL_KEY });
    startStream(true);
  }, [queryClient, startStream]);

  const refetch = useCallback(() => {
    startStream();
  }, [startStream]);

  const data = query.data ?? null;

  return {
    data,
    isLoading: !data && !streaming.isStreaming && query.isLoading,
    isError: query.isError && !data && !streaming.isStreaming,
    isStreaming: streaming.isStreaming && !data,
    streamingMetrics: streaming.metrics,
    streamingText: streaming.rawText,
    refetch,
    forceRefresh,
    hasData: !!data,
  };
}
