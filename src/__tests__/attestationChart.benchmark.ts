import { SlidingWindowBatcher } from '@/src/lib/slidingWindowBatcher';
import { aggregateToOneSecond } from '@/src/lib/aggregateAttestations';
import type { AttestationPoint } from '@/src/lib/aggregateAttestations';

function generateSyntheticAttestationStream(
  count: number,
  startTime: number,
): AttestationPoint[] {
  const points: AttestationPoint[] = [];
  for (let i = 0; i < count; i++) {
    const baseThroughput = 50 + Math.sin(i / 100) * 30;
    points.push({
      timestamp: startTime + i * 5,
      throughput: baseThroughput + (Math.random() - 0.5) * 40,
      successRate: 0.85 + Math.random() * 0.15,
      latency: 20 + Math.random() * 80,
    });
  }
  return points;
}

async function simulateWebSocketStream(
  points: AttestationPoint[],
  batchIntervalMs: number,
  maxWindow: number,
): Promise<{ renderCount: number; totalDuration: number }> {
  return new Promise((resolve, reject) => {
    let renderCount = 0;
    let totalDuration = 0;
    let resolved = false;

    const batcher = new SlidingWindowBatcher<AttestationPoint>(
      batchIntervalMs,
      maxWindow,
    );

    batcher.subscribe((batch) => {
      const start = performance.now();
      const aggregated = aggregateToOneSecond(batch);
      if (aggregated.length > maxWindow) {
        aggregated.splice(0, aggregated.length - maxWindow);
      }
      const duration = performance.now() - start;
      renderCount++;
      totalDuration += duration;
    });

    batcher.start();

    let idx = 0;
    const pushInterval = setInterval(() => {
      if (idx >= points.length) {
        clearInterval(pushInterval);
        setTimeout(() => {
          batcher.stop();
          if (!resolved) {
            resolved = true;
            resolve({ renderCount, totalDuration });
          }
        }, batchIntervalMs + 100);
        return;
      }
      batcher.push(points[idx++]);
    }, 5);

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        batcher.stop();
        clearInterval(pushInterval);
        reject(new Error('Benchmark timed out'));
      }
    }, 70_000);
  });
}

async function runBenchmark(): Promise<void> {
  const MSG_PER_SEC = 200;
  const DURATION_SEC = 60;
  const TOTAL_POINTS = MSG_PER_SEC * DURATION_SEC;
  const BATCH_INTERVAL_MS = 500;
  const MAX_WINDOW = 300;
  const MAX_EXPECTED_RENDERS = DURATION_SEC * 2;
  const MAX_AVG_RENDER_MS = 16;

  console.log(
    `Simulating ${TOTAL_POINTS} WebSocket messages over ${DURATION_SEC}s (${MSG_PER_SEC} msg/sec)...`,
  );

  const points = generateSyntheticAttestationStream(
    TOTAL_POINTS,
    Date.now(),
  );

  const { renderCount, totalDuration } = await simulateWebSocketStream(
    points,
    BATCH_INTERVAL_MS,
    MAX_WINDOW,
  );

  const avgRenderDuration = renderCount > 0 ? totalDuration / renderCount : 0;

  console.log('\n=== Benchmark Results ===');
  console.log(`Total messages: ${TOTAL_POINTS}`);
  console.log(`Render count: ${renderCount}`);
  console.log(`Expected max renders: ${MAX_EXPECTED_RENDERS}`);
  console.log(`Average render duration: ${avgRenderDuration.toFixed(3)}ms`);
  console.log(`Max allowed avg render: ${MAX_AVG_RENDER_MS}ms`);

  const renderPassed = renderCount <= MAX_EXPECTED_RENDERS;
  const durationPassed = avgRenderDuration < MAX_AVG_RENDER_MS;

  console.log(
    `\nRender count ≤ ${MAX_EXPECTED_RENDERS}: ${renderPassed ? 'PASS' : 'FAIL'} (${renderCount})`,
  );
  console.log(
    `Avg render < ${MAX_AVG_RENDER_MS}ms: ${durationPassed ? 'PASS' : 'FAIL'} (${avgRenderDuration.toFixed(3)}ms)`,
  );

  if (!renderPassed) {
    throw new Error(
      `Render count ${renderCount} exceeds max ${MAX_EXPECTED_RENDERS}`,
    );
  }
  if (!durationPassed) {
    throw new Error(
      `Average render duration ${avgRenderDuration.toFixed(3)}ms exceeds ${MAX_AVG_RENDER_MS}ms budget`,
    );
  }

  console.log('\nBenchmark completed successfully.');
}

if (
  typeof window !== 'undefined' &&
  typeof (globalThis as Record<string, unknown>).__BENCHMARK_RUN !== 'undefined'
) {
  runBenchmark()
    .then(() => console.log('Benchmark completed successfully.'))
    .catch((err) => console.error('Benchmark failed:', err));
}

export { runBenchmark, generateSyntheticAttestationStream, simulateWebSocketStream };
