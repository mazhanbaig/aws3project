export async function register() {
  // Only run on the server, not during build — also skip Edge runtime
  if (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    typeof (globalThis as Record<string, unknown>).EdgeRuntime === 'string'
  ) {
    return;
  }

  try {
    const { initSchema } = await import('@/lib/db');
    await initSchema();
    console.log('[Instrumentation] Database schema initialized');
  } catch (err) {
    console.error('[Instrumentation] Failed to initialize schema:', err);
  }

  try {
    const { startScheduler } = await import('@/lib/scheduler');
    startScheduler();
  } catch (err) {
    console.error('[Instrumentation] Failed to start scheduler:', err);
  }
}
