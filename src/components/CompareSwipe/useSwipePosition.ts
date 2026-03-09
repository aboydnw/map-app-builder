import { useCallback, useRef, useState } from "react";

export interface SwipeHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}

export interface UseSwipePositionReturn {
  position: number;
  isDragging: boolean;
  handlers: SwipeHandlers;
}

/** Manages drag state for a swipe divider, returning position as 0-100 percentage. */
export function useSwipePosition(
  initialPosition = 50
): UseSwipePositionReturn {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<Element | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    containerRef.current = (e.target as Element).parentElement;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setPosition(pct);
    },
    [isDragging]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
  }, []);

  return {
    position,
    isDragging,
    handlers: { onPointerDown, onPointerMove, onPointerUp }
  };
}
