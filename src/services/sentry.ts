interface LogoutEvent {
  previousRoute: string
  walletType: string
  sessionDuration: number
  pendingTransactionsCount: number
}

export async function captureLogoutEvent(event: LogoutEvent) {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      // @ts-expect-error - @sentry/nextjs is optional, caught at runtime
      const { captureEvent } = await import("@sentry/nextjs")
      captureEvent({
        message: "Forced logout due to wallet disconnect",
        level: "warning",
        tags: { walletType: event.walletType },
        extra: event,
      })
    } catch {
      console.warn("[Sentry] @sentry/nextjs not configured; skipping event", event)
    }
  } else {
    console.info("[Sentry audit]", event)
  }
}
