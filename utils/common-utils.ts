export async function parseJsonSafe<T = unknown>(response: Response): Promise<T | Record<string, unknown>> {
  try {
    // @ts-ignore Response type is provided by Playwright at runtime; placeholder here for foundation.
    return await response.json();
  } catch {
    return {};
  }
}
