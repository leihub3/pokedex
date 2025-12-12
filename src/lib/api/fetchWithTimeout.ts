/**
 * Fetch with timeout and retry logic
 * Works in both client and server environments
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 30000, // 30 seconds default
  retries = 2
): Promise<Response> {
  let timeoutId: NodeJS.Timeout | null = null;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  try {
    // Set up timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller?.abort();
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });

    // Set up fetch
    const fetchPromise = fetch(url, {
      ...options,
      signal: controller?.signal,
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    cleanup();
    return response;
  } catch (error) {
    cleanup();
    
    // Retry on network errors or timeouts
    const shouldRetry = retries > 0 && (
      (error instanceof Error && (
        error.name === 'AbortError' ||
        error.message.includes('timeout') ||
        error.message.includes('TIMEOUT')
      )) ||
      (error as any)?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
      (error as any)?.code === 'ETIMEDOUT'
    );

    if (shouldRetry) {
      // Wait a bit before retrying (exponential backoff)
      const delay = 1000 * (3 - retries); // 1s, 2s
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithTimeout(url, options, timeout, retries - 1);
    }
    
    throw error;
  }
}

