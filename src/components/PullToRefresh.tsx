import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullStart, setPullStart] = useState<number | null>(null);

  const PULL_THRESHOLD = 70; // px
  const MAX_PULL = 130; // px

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      setPullStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isRefreshing || pullStart === null) return;
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - pullStart;
      if (diff > 0) {
        // Prevent default scrolling down behavior to avoid browser bounce
        if (e.cancelable) {
          e.preventDefault();
        }
        // Apply resistance so pull action feels elastic
        const resistance = 0.45;
        const distance = Math.min(diff * resistance, MAX_PULL);
        setPullDistance(distance);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (isRefreshing || pullStart === null) return;
    setPullStart(null);

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      
      // Tactile activation pattern (double tap feel or strong click)
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        try { window.navigator.vibrate([15, 30, 15]); } catch (err) {}
      }

      try {
        await onRefresh();
      } catch (error) {
        console.error("Failed to refresh daily content:", error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        // Bouncy completion click
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          try { window.navigator.vibrate(10); } catch (err) {}
        }
      }
    } else {
      setPullDistance(0);
    }
  };

  // Support Mouse events to enable testing on Desktop web browsers as well!
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isRefreshing) return;
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      setPullStart(e.clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isRefreshing || pullStart === null) return;
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      const diff = e.clientY - pullStart;
      if (diff > 0) {
        const resistance = 0.45;
        const distance = Math.min(diff * resistance, MAX_PULL);
        setPullDistance(distance);
      }
    }
  };

  const handleMouseUpOrLeave = () => {
    if (pullStart === null) return;
    handleTouchEnd();
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 overflow-y-auto select-none touch-pan-y h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
    >
      {/* Pull Indicator Container */}
      <div 
        className="absolute left-0 right-0 z-[1100] flex justify-center pointer-events-none transition-all duration-150 ease-out"
        style={{
          transform: `translateY(${pullDistance - 54}px)`,
          opacity: pullDistance > 12 ? 1 : 0,
        }}
      >
        <div className="bg-surface-container-high text-primary border border-outline-variant/40 px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: pullDistance * 4 }}
            transition={isRefreshing ? { repeat: Infinity, duration: 0.9, ease: "linear" } : { duration: 0.05 }}
          >
            <RefreshCw size={16} className="stroke-[2.5px]" />
          </motion.div>
          <span className="text-xs font-semibold tracking-wider text-on-surface-variant font-sans uppercase select-none">
            {isRefreshing ? 'Aktualizuje sa...' : pullDistance >= PULL_THRESHOLD ? 'Pusti na aktualizáciu' : 'Potiahni na aktualizáciu'}
          </span>
        </div>
      </div>

      {/* Main Content wrapper - push down slightly if refreshing */}
      <div 
        className="h-full transition-transform duration-150 ease-out"
        style={{ transform: `translateY(${isRefreshing ? 48 : pullDistance * 0.3}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
