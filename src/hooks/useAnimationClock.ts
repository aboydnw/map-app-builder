import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAnimationClockOptions {
  totalFrames: number;
  fps?: number;
  loop?: boolean;
  initialSpeed?: number;
}

export interface UseAnimationClockReturn {
  currentIndex: number;
  setIndex: (index: number) => void;
  isPlaying: boolean;
  setPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  speed: number;
  setSpeed: (speed: number) => void;
  stepForward: () => void;
  stepBack: () => void;
}

export function useAnimationClock({
  totalFrames,
  fps = 2,
  loop = true,
  initialSpeed = 1
}: UseAnimationClockOptions): UseAnimationClockReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const rafRef = useRef(0);
  const lastTickRef = useRef(0);

  const setIndex = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(totalFrames - 1, index)));
    },
    [totalFrames]
  );

  const stepForward = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= totalFrames) return loop ? 0 : totalFrames - 1;
      return next;
    });
  }, [totalFrames, loop]);

  const stepBack = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev - 1;
      if (next < 0) return loop ? totalFrames - 1 : 0;
      return next;
    });
  }, [totalFrames, loop]);

  const togglePlay = useCallback(() => {
    setIsPlaying((current) => !current);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const interval = 1000 / (fps * speed);

    const tick = (timestamp: number) => {
      if (timestamp - lastTickRef.current >= interval) {
        lastTickRef.current = timestamp;
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= totalFrames) {
            if (!loop) {
              setIsPlaying(false);
              return totalFrames - 1;
            }
            return 0;
          }
          return next;
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, fps, speed, totalFrames, loop]);

  return {
    currentIndex,
    setIndex,
    isPlaying,
    setPlaying: setIsPlaying,
    togglePlay,
    speed,
    setSpeed,
    stepForward,
    stepBack
  };
}
