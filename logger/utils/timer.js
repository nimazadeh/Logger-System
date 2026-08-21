/**
 * Create a high-resolution timer.
 * Call timer.elapsed() to get milliseconds since creation.
 */
export function createTimer() {
  const start = process.hrtime.bigint();
  return {
    elapsed() {
      const end = process.hrtime.bigint();
      return Number(end - start) / 1e6; // nanoseconds → milliseconds
    },
  };
}
