export interface AttestationPoint {
  timestamp: number;
  throughput: number;
  successRate: number;
  latency: number;
}

export interface ChartSeries {
  time: number;
  throughput: number;
  successRate: number;
  latency: number;
}

export function transformRawToChartSeries(
  data: AttestationPoint[],
  maxPoints: number = 300,
): ChartSeries[] {
  const sliced = data.length > maxPoints ? data.slice(-maxPoints) : data;

  return sliced.map((point) => ({
    time: point.timestamp,
    throughput: point.throughput,
    successRate: point.successRate,
    latency: point.latency,
  }));
}

export function aggregateToOneSecond(
  points: AttestationPoint[],
): AttestationPoint[] {
  if (points.length === 0) return [];

  const buckets = new Map<number, AttestationPoint[]>();

  for (const point of points) {
    const bucketKey = Math.floor(point.timestamp / 1000) * 1000;
    const existing = buckets.get(bucketKey);
    if (existing) {
      existing.push(point);
    } else {
      buckets.set(bucketKey, [point]);
    }
  }

  const result: AttestationPoint[] = [];
  for (const [, bucket] of buckets) {
    const avgThroughput =
      bucket.reduce((sum, p) => sum + p.throughput, 0) / bucket.length;
    const avgSuccessRate =
      bucket.reduce((sum, p) => sum + p.successRate, 0) / bucket.length;
    const avgLatency =
      bucket.reduce((sum, p) => sum + p.latency, 0) / bucket.length;

    result.push({
      timestamp: bucket[0].timestamp,
      throughput: avgThroughput,
      successRate: avgSuccessRate,
      latency: avgLatency,
    });
  }

  return result.sort((a, b) => a.timestamp - b.timestamp);
}
