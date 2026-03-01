import { useState } from "react";

export interface UseTimeRangeOptions {
  min: number;
  max: number;
  initialStart?: number;
  initialEnd?: number;
}

export interface UseTimeRangeReturn {
  start: number;
  end: number;
  setStart: (value: number) => void;
  setEnd: (value: number) => void;
}

export function useTimeRange({ min, max, initialStart, initialEnd }: UseTimeRangeOptions): UseTimeRangeReturn {
  const [start, setStartState] = useState(initialStart ?? min);
  const [end, setEndState] = useState(initialEnd ?? max);

  return {
    start,
    end,
    setStart: (value) => setStartState(Math.min(Math.max(value, min), end)),
    setEnd: (value) => setEndState(Math.max(Math.min(value, max), start))
  };
}
