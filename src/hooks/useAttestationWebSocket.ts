'use client';

import { useEffect, useRef, useState } from 'react';
import { SlidingWindowBatcher } from '@/src/lib/slidingWindowBatcher';
import type { AttestationPoint } from '@/src/lib/aggregateAttestations';

interface WebSocketConfig {
  url: string;
  batchIntervalMs?: number;
  maxWindow?: number;
}

interface UseAttestationWebSocketReturn {
  batchedData: AttestationPoint[];
  isConnected: boolean;
  isBatching: boolean;
  error: string | null;
}

export function useAttestationWebSocket(
  config: WebSocketConfig,
): UseAttestationWebSocketReturn {
  const { url, batchIntervalMs = 500, maxWindow = 300 } = config;

  const [batchedData, setBatchedData] = useState<AttestationPoint[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isBatching, setIsBatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const batcherRef = useRef<SlidingWindowBatcher<AttestationPoint> | null>(null);
  const initErrorRef = useRef<string | null>(null);

  useEffect(() => {
    const batcher = new SlidingWindowBatcher<AttestationPoint>(
      batchIntervalMs,
      maxWindow,
    );

    batcher.subscribe((batch) => {
      const start = performance.now();

      setBatchedData((prev) => {
        const updated = [...prev, ...batch];
        return updated.length > maxWindow
          ? updated.slice(-maxWindow)
          : updated;
      });

      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        const duration = performance.now() - start;
        const perf = (window as unknown as Record<string, unknown>).__VERINODE_PERF__ as
          | { chartRenderDuration: number }
          | undefined;
        if (perf) {
          perf.chartRenderDuration = duration;
        }
      }
    });

    batcher.onIdle((idle) => {
      setIsBatching(!idle);
    });

    batcher.start();
    batcherRef.current = batcher;

    return () => {
      batcher.stop();
      batcherRef.current = null;
    };
  }, [batchIntervalMs, maxWindow]);

  useEffect(() => {
    let ws: WebSocket;

    try {
      ws = new WebSocket(url);
    } catch (err) {
      initErrorRef.current = err instanceof Error ? err.message : 'Failed to create WebSocket';
      return;
    }

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const point = JSON.parse(event.data) as AttestationPoint;
        batcherRef.current?.push(point);
      } catch {
        /* skip malformed messages */
      }
    };

    ws.onerror = () => {
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [url]);

  useEffect(() => {
    if (initErrorRef.current) {
      setError(initErrorRef.current);
    }
  }, []);

  return { batchedData, isConnected, isBatching, error };
}
