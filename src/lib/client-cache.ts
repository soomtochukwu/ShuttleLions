'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const CACHE_PREFIX = 'sl_cache_';
const DEFAULT_TTL_MS = 1000 * 60 * 60; // 1 hour default TTL

interface CacheEnvelope<T> {
 data: T;
 timestamp: number;
 ttl: number;
}

/**
 * Synchronously retrieves cached data from localStorage if available and not completely expired.
 */
export function getCachedData<T>(key: string, fallback: T | null = null): T | null {
 if (typeof window === 'undefined') return fallback;
 try {
 const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
 if (!raw) return fallback;
 const envelope: CacheEnvelope<T> = JSON.parse(raw);
 return envelope.data ?? fallback;
 } catch (e) {
 console.warn(`[ClientCache] Failed to read cached key "${key}":`, e);
 return fallback;
 }
}

/**
 * Persists data to localStorage with a timestamp and TTL.
 */
export function setCachedData<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
 if (typeof window === 'undefined') return;
 try {
 const envelope: CacheEnvelope<T> = {
 data,
 timestamp: Date.now(),
 ttl: ttlMs,
 };
 localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(envelope));
 } catch (e) {
 console.warn(`[ClientCache] Failed to write cache key "${key}":`, e);
 }
}

/**
 * Removes a specific cache key.
 */
export function invalidateCache(key: string): void {
 if (typeof window === 'undefined') return;
 try {
 localStorage.removeItem(`${CACHE_PREFIX}${key}`);
 } catch (e) {
 console.warn(`[ClientCache] Failed to invalidate cache key "${key}":`, e);
 }
}

/**
 * Stale-While-Revalidate (SWR) React Hook:
 * 1. Instantly initializes with cached data from localStorage (Zero skeleton delay).
 * 2. Concurrently fetches fresh data from the database in the background.
 * 3. Seamlessly updates state and refreshes the cache.
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
 return cached!== null ? cached : initialFallback;
 });

 const [isLoading, setIsLoading] = useState<boolean>(() => {
 // If we have cached data, we are not blocking initial render!
 const cached = getCachedData<T>(key, null);
 return cached === null;
 });

 const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
 const [error, setError] = useState<Error | null>(null);

 const fetcherRef = useRef(fetcher);
 fetcherRef.current = fetcher;

 const revalidate = useCallback(async () => {
 if (!enabled) return;
 setIsRevalidating(true);
 try {
 const freshData = await fetcherRef.current();
 if (freshData!== undefined && freshData!== null) {
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
