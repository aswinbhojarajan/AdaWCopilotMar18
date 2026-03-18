import React, { useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}

const THRESHOLD = 60;
const MAX_PULL = 100;

export const PullToRefresh = forwardRef<HTMLDivElement, PullToRefreshProps>(function PullToRefresh(
  { onRefresh, children, className = '' },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  useImperativeHandle(ref, () => containerRef.current!, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0 || isRefreshing) return;
    startYRef.current = e.touches[0].clientY;
    isPullingRef.current = true;
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return;
    const el = containerRef.current;
    if (!el || el.scrollTop > 0) {
      isPullingRef.current = false;
      setPullDistance(0);
      return;
    }

    const diff = e.touches[0].clientY - startYRef.current;
    if (diff > 0) {
      const dampened = Math.min(diff * 0.5, MAX_PULL);
      setPullDistance(dampened);
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const showIndicator = pullDistance > 10;

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {showIndicator && (
        <div
          className="flex items-center justify-center transition-all duration-150"
          style={{ height: `${pullDistance}px` }}
        >
          <div
            className={`w-[24px] h-[24px] border-2 border-[#441316] border-t-transparent rounded-full ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: `rotate(${progress * 360}deg)`,
              opacity: progress,
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
});
