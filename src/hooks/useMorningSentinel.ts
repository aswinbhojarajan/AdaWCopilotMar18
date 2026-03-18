import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { MorningSentinelResponse } from '../types';

const SENTINEL_KEY = ['morning-sentinel'];
const STALE_TIME = 4 * 60 * 60 * 1000;
const STREAM_FALLBACK_DELAY_MS = 300;

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
  const hasStartedRef = useRef(false);

  const [data, setData] = useState<MorningSentinelResponse | null>(() => {
    return queryClient.getQueryData<MorningSentinelResponse>(SENTINEL_KEY) ?? null;
  });

  const [streaming, setStreaming] = useState<StreamingState>({
    isStreaming: false,
    metrics: null,
    rawText: '',
  });

  const [isError, setIsError] = useState(false);

  const startStream = useCallback((refresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStreaming({ isStreaming: true, metrics: null, rawText: '' });
    setIsError(false);

    const url = refresh ? '/api/morning-sentinel/stream?refresh=true' : '/api/morning-sentinel/stream';

    consumeSentinelStream(
      url,
      (metrics) => setStreaming(s => ({ ...s, metrics })),
      (chunk) => setStreaming(s => ({ ...s, rawText: s.rawText + chunk })),
      (completedData) => {
        setStreaming({ isStreaming: false, metrics: null, rawText: '' });
        setData(completedData);
        queryClient.setQueryData(SENTINEL_KEY, completedData);
      },
      controller.signal,
    ).catch((err) => {
      if (err.name !== 'AbortError') {
        console.error('Sentinel stream error:', err);
        setStreaming(s => ({ ...s, isStreaming: false }));
        setIsError(true);
      }
    });
  }, [queryClient]);

  useEffect(() => {
    if (data || hasStartedRef.current) return undefined;

    const cachedData = queryClient.getQueryData<MorningSentinelResponse>(SENTINEL_KEY);
    if (cachedData) {
      setData(cachedData);
      return undefined;
    }

    const timer = setTimeout(() => {
      const freshCheck = queryClient.getQueryData<MorningSentinelResponse>(SENTINEL_KEY);
      if (freshCheck) {
        setData(freshCheck);
        return;
      }
      hasStartedRef.current = true;
      startStream();
    }, STREAM_FALLBACK_DELAY_MS);

    return () => clearTimeout(timer);
  }, [data, queryClient, startStream]);

  useEffect(() => {
    if (data) return undefined;

    const unsub = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.queryKey[0] === 'morning-sentinel') {
        const newData = event.query.state.data as MorningSentinelResponse | undefined;
        if (newData) {
          setData(newData);
          abortRef.current?.abort();
          setStreaming({ isStreaming: false, metrics: null, rawText: '' });
        }
      }
    });

    return unsub;
  }, [data, queryClient]);

  const forceRefresh = useCallback(async () => {
    queryClient.removeQueries({ queryKey: SENTINEL_KEY });
    setData(null);
    hasStartedRef.current = true;
    startStream(true);
  }, [queryClient, startStream]);

  const refetch = useCallback(() => {
    setData(null);
    hasStartedRef.current = true;
    startStream();
  }, [startStream]);

  return {
    data,
    isLoading: !data && !streaming.isStreaming && !isError,
    isError: isError && !data && !streaming.isStreaming,
    isStreaming: streaming.isStreaming,
    streamingMetrics: streaming.metrics,
    streamingText: streaming.rawText,
    refetch,
    forceRefresh,
    hasData: !!data,
  };
}
