export async function register() {
  // Only run on the server, not during build — also skip Edge runtime
  if (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    typeof (globalThis as Record<string, unknown>).EdgeRuntime === 'string'
  ) {
    return;
  }

  try {
    const { startScheduler } = await import('@/lib/scheduler');
    startScheduler();
  } catch (err) {
    console.error('[Instrumentation] Failed to start scheduler:', err);
  }
}
