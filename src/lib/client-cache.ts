'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const CACHE_PREFIX = 'sl_cache_';
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours default TTL for instant local UX

interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// In-Memory Fast Cache Layer
const memoryCache = new Map<string, CacheEnvelope<any>>();

/**
 * Synchronously retrieves cached data from in-memory cache or localStorage.
 */
export function getCachedData<T>(key: string, fallback: T | null = null): T | null {
  if (!key) return fallback;

  // 1. Fast path: in-memory cache
  const mem = memoryCache.get(key);
  if (mem) {
    return mem.data ?? fallback;
  }

  // 2. Persistent path: localStorage
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return fallback;
    const envelope: CacheEnvelope<T> = JSON.parse(raw);
    // Populate memory cache
    memoryCache.set(key, envelope);
    return envelope.data ?? fallback;
  } catch (e) {
    console.warn(`[ClientCache] Failed to read cached key "${key}":`, e);
    return fallback;
  }
}

/**
 * Persists data to both in-memory cache and localStorage, and broadcasts an update event.
 */
export function setCachedData<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  if (!key) return;

  const envelope: CacheEnvelope<T> = {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  };

  // 1. In-memory
  memoryCache.set(key, envelope);

  // 2. localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(envelope));
      // Notify other components listening in the current window
      window.dispatchEvent(
        new CustomEvent('sl_cache_updated', {
          detail: { key, data },
        })
      );
    } catch (e) {
      console.warn(`[ClientCache] Failed to write cache key "${key}":`, e);
    }
  }
}

/**
 * Removes a specific cache key from memory and localStorage.
 */
export function invalidateCache(key: string): void {
  if (!key) return;
  memoryCache.delete(key);
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    window.dispatchEvent(
      new CustomEvent('sl_cache_invalidated', {
        detail: { key },
      })
    );
  } catch (e) {
    console.warn(`[ClientCache] Failed to invalidate cache key "${key}":`, e);
  }
}

/**
 * Universal Stale-While-Revalidate (SWR) React Hook:
 * 1. Synchronously initializes state from cache (0ms skeleton delay).
 * 2. Concurrently revalidates from database in the background.
 * 3. Automatically stays synchronized with sibling components and across route switches.
 */
export function useCachedQuery<T>({
  key,
  fetcher,
  initialFallback,
  ttlMs = DEFAULT_TTL_MS,
  enabled = true,
}: {
  key: string;
  fetcher: () => Promise<T>;
  initialFallback: T;
  ttlMs?: number;
  enabled?: boolean;
}) {
  const [data, setData] = useState<T>(() => {
    const cached = getCachedData<T>(key, null);
    return cached !== null ? cached : initialFallback;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (!enabled) return false;
    const cached = getCachedData<T>(key, null);
    return cached === null;
  });

  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // React to key or enabled transitions
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    const cached = getCachedData<T>(key, null);
    if (cached !== null) {
      setData(cached);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [key, enabled]);

  // Background Revalidation
  const revalidate = useCallback(async () => {
    if (!enabled || !key) return;
    setIsRevalidating(true);
    try {
      const freshData = await fetcherRef.current();
      if (freshData !== undefined && freshData !== null) {
        setData(freshData);
        setCachedData(key, freshData, ttlMs);
      }
      setError(null);
    } catch (err: any) {
      console.warn(`[ClientCache] Revalidation error for key "${key}":`, err);
      setError(err);
    } finally {
      setIsLoading(false);
      setIsRevalidating(false);
    }
  }, [key, ttlMs, enabled]);

  useEffect(() => {
    revalidate();
  }, [revalidate]);

  // Listen to cross-component cache sync
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCacheUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; data: T }>;
      if (customEvent.detail && customEvent.detail.key === key) {
        setData(customEvent.detail.data);
        setIsLoading(false);
      }
    };

    window.addEventListener('sl_cache_updated', handleCacheUpdate);
    return () => {
      window.removeEventListener('sl_cache_updated', handleCacheUpdate);
    };
  }, [key]);

  // Direct optimistic mutation
  const updateDataDirectly = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setData((prev) => {
        const next = typeof updater === 'function' ? (updater as any)(prev) : updater;
        setCachedData(key, next, ttlMs);
        return next;
      });
    },
    [key, ttlMs]
  );

  return {
    data,
    setData: updateDataDirectly,
    isLoading,
    isRevalidating,
    error,
    refetch: revalidate,
  };
}
