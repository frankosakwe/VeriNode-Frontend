'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { transformRawToChartSeries } from '@/src/lib/aggregateAttestations';
import type { AttestationPoint, ChartSeries } from '@/src/lib/aggregateAttestations';
import {
  CHART_DIMENSIONS,
  CHART_MARGINS,
  CHART_COLORS,
  ANIMATION_DURATION,
} from '@/src/components/charts/chartConfig';

interface AttestationPerformanceProps {
  data: AttestationPoint[];
  isBatching: boolean;
}

const chartDataKey = (series: ChartSeries[]): number =>
  series.length > 0 ? series[series.length - 1].time : 0;

const MemoizedChart = React.memo(
  function MemoizedChart({
    chartSeries,
    animationDuration,
  }: {
    chartSeries: ChartSeries[];
    animationDuration: number;
  }) {
    return (
      <ResponsiveContainer width={CHART_DIMENSIONS.width} height={CHART_DIMENSIONS.height}>
        <LineChart data={chartSeries} margin={CHART_MARGINS}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(t: number) => new Date(t).toLocaleTimeString()}
          />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            labelFormatter={(t: number) => new Date(t).toLocaleTimeString()}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="throughput"
            stroke={CHART_COLORS.throughput}
            name="Throughput"
            animationDuration={animationDuration}
            isAnimationActive={animationDuration > 0}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="successRate"
            stroke={CHART_COLORS.successRate}
            name="Success Rate"
            animationDuration={animationDuration}
            isAnimationActive={animationDuration > 0}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="latency"
            stroke={CHART_COLORS.latency}
            name="Latency"
            animationDuration={animationDuration}
            isAnimationActive={animationDuration > 0}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  },
  (prevProps, nextProps) => {
    const prevKey = chartDataKey(prevProps.chartSeries);
    const nextKey = chartDataKey(nextProps.chartSeries);
    return prevKey === nextKey;
  },
);

export function AttestationPerformance({
  data,
  isBatching,
}: AttestationPerformanceProps) {
  const dataLength = data.length;

  const chartSeries = useMemo(
    () => transformRawToChartSeries(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataLength],
  );

  const animationDuration = isBatching
    ? ANIMATION_DURATION.disabled
    : ANIMATION_DURATION.active;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Attestation Performance</h2>
      <MemoizedChart
        chartSeries={chartSeries}
        animationDuration={animationDuration}
      />
    </div>
  );
}
