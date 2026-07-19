/**
 * Utility allocators for parallel-safe UI tests.
 * Map worker index to a seeded employee ID (1..5).
 */
export function workerEmployeeId(workerIndex: number): number {
  return (workerIndex % 5) + 1;
}
