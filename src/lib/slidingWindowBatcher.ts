type BatchCallback<T> = (batch: T[]) => void;

export class SlidingWindowBatcher<T> {
  private buffer: T[] = [];
  private intervalMs: number;
  private maxWindow: number;
  private subscriber: BatchCallback<T> | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastPushTime: number = 0;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private onIdleChange: ((isIdle: boolean) => void) | null = null;
  private _isIdle: boolean = true;

  constructor(intervalMs: number, maxWindow: number) {
    this.intervalMs = intervalMs;
    this.maxWindow = maxWindow;
  }

  get isIdle(): boolean {
    return this._isIdle;
  }

  push(point: T): void {
    this.buffer.push(point);
    this.lastPushTime = performance.now();

    if (this._isIdle) {
      this._isIdle = false;
      this.onIdleChange?.(false);
    }

    this.resetIdleTimer();
  }

  subscribe(callback: BatchCallback<T>): void {
    this.subscriber = callback;
  }

  onIdle(callback: (isIdle: boolean) => void): void {
    this.onIdleChange = callback;
  }

  start(): void {
    if (this.intervalId) return;

    const flush = () => {
      if (this.buffer.length === 0) return;
      const batch = this.buffer.splice(0);
      if (batch.length > this.maxWindow) {
        batch.splice(0, batch.length - this.maxWindow);
      }
      this.subscriber?.(batch);
    };

    const tick = () => {
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => flush());
      } else {
        flush();
      }
    };

    this.intervalId = setInterval(tick, this.intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.clearIdleTimer();
  }

  drain(): T[] {
    const remaining = this.buffer.splice(0);
    this.stop();
    return remaining;
  }

  private resetIdleTimer(): void {
    this.clearIdleTimer();
    this.idleTimer = setTimeout(() => {
      this._isIdle = true;
      this.onIdleChange?.(true);
    }, 1000);
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
}
