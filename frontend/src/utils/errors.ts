/**
 * Wraps a synchronous or asynchronous function with a try/catch block.
 * Logs any encountered error and returns the provided fallback value,
 * ensuring the application doesn't crash.
 */
export function safeWrap<T, Args extends any[]>(
  fn: (...args: Args) => T,
  fallback: T | (() => T)
): (...args: Args) => T {
  return (...args: Args): T => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return (result as Promise<any>).catch((err) => {
          console.error('[Frontend SafeWrap Async Error]:', err);
          return typeof fallback === 'function' ? (fallback as Function)() : fallback;
        }) as any;
      }
      return result;
    } catch (err) {
      console.error('[Frontend SafeWrap Sync Error]:', err);
      return typeof fallback === 'function' ? (fallback as Function)() : fallback;
    }
  };
}
