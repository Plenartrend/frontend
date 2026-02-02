import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  fetchUrl: string;
  pageSize?: number;
  enabled?: boolean;
}

export function useInfiniteScroll<T>({ 
  fetchUrl, 
  pageSize = 20,
  enabled = true 
}: UseInfiniteScrollOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async (currentOffset: number, isInitial: boolean) => {
    if (isFetchingRef.current || !enabled) return;
    
    isFetchingRef.current = true;
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const separator = fetchUrl.includes('?') ? '&' : '?';
      const url = `${fetchUrl}${separator}offset=${currentOffset}&page_size=${pageSize}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Handle both paginated and non-paginated responses
      let items: T[];
      let total: number;
      
      if (Array.isArray(result)) {
        // Non-paginated response (mock data)
        items = result.slice(currentOffset, currentOffset + pageSize);
        total = result.length;
      } else {
        // Paginated response
        items = result.data || [];
        total = result.total_items || 0;
      }

      setData(prev => isInitial ? items : [...prev, ...items]);
      setTotalItems(total);
      setOffset(currentOffset + items.length);
      setHasMore(currentOffset + items.length < total);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [fetchUrl, pageSize, enabled]);

  // Initial load
  useEffect(() => {
    if (enabled) {
      setData([]);
      setOffset(0);
      setHasMore(true);
      fetchData(0, true);
    }
  }, [fetchUrl, enabled, fetchData]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!enabled || loading || !hasMore) return;

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && !isFetchingRef.current && hasMore) {
        fetchData(offset, false);
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, loading, hasMore, offset, fetchData]);

  const reset = useCallback(() => {
    setData([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
    fetchData(0, true);
  }, [fetchData]);

  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    totalItems,
    loadMoreRef,
    reset,
  };
}
