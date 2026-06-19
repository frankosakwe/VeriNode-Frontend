export const CHART_DIMENSIONS = {
  width: '100%',
  height: 400,
} as const;

export const CHART_MARGINS = {
  top: 20,
  right: 30,
  left: 20,
  bottom: 5,
} as const;

export const ANIMATION_DURATION = {
  active: 300,
  disabled: 0,
} as const;

export const CHART_COLORS = {
  throughput: '#8884d8',
  successRate: '#82ca9d',
  latency: '#ff7300',
} as const;

export const IDLE_TIMEOUT_MS = 1000;
