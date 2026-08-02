import type { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: any;
  headers: Record<string, string>;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Simple in-memory response cache for GET endpoints.
 * Caches the JSON response body for `ttlMs` milliseconds.
 * Cache key = req.originalUrl (includes query params).
 */
export function cacheMiddleware(ttlMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const key = req.originalUrl;
    const entry = cache.get(key);

    if (entry && Date.now() - entry.timestamp < ttlMs) {
      // Set cache headers
      res.set('X-Cache', 'HIT');
      res.set(
        'Cache-Control',
        `public, max-age=${Math.floor(ttlMs / 1000)}, stale-while-revalidate=${Math.floor(ttlMs / 2000)}`,
      );
      res.json(entry.data);
      return;
    }

    // Intercept res.json to capture the response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, {
          data: body,
          headers: {},
          timestamp: Date.now(),
        });
      }
      res.set('X-Cache', 'MISS');
      res.set(
        'Cache-Control',
        `public, max-age=${Math.floor(ttlMs / 1000)}, stale-while-revalidate=${Math.floor(ttlMs / 2000)}`,
      );
      return originalJson(body);
    };

    next();
  };
}

/**
 * Invalidate cache entries matching a prefix.
 * Call after mutations (POST/PUT/DELETE) to clear stale data.
 */
export function invalidateCache(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export function clearAllCache() {
  cache.clear();
}

/**
 * Middleware that adds Cache-Control headers without in-memory caching.
 * Good for endpoints that change per-user but benefit from browser caching.
 */
export function setCacheHeaders(maxAgeSec: number, isPrivate = false) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const scope = isPrivate ? 'private' : 'public';
    res.set(
      'Cache-Control',
      `${scope}, max-age=${maxAgeSec}, stale-while-revalidate=${Math.floor(maxAgeSec / 2)}`,
    );
    next();
  };
}
