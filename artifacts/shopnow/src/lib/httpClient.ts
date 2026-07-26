/**
 * Global HTTP client with automatic 401 handling
 * Detects session expiry from API responses and triggers logout
 */

let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

export function handleUnauthorized() {
  console.log('[HTTP Client] 401 Unauthorized - triggering logout');
  if (logoutCallback) {
    logoutCallback();
  }
}

/**
 * Wrap fetch to handle 401 responses globally
 */
export async function fetchWithAuth(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: options?.credentials || 'include',
    });

    // If we get a 401, the session has expired
    if (response.status === 401) {
      console.log(`[HTTP Client] 401 response from ${url}`);
      // Clone the response so we can read it twice if needed
      const clonedResponse = response.clone();

      // Check if this isn't already the /auth/me endpoint to avoid infinite loops
      if (!url.includes('/auth/me')) {
        handleUnauthorized();
      }

      return clonedResponse;
    }

    return response;
  } catch (error) {
    console.error('[HTTP Client] Fetch error:', error);
    throw error;
  }
}
