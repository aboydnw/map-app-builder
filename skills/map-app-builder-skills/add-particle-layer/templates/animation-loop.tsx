// requestAnimationFrame loop to drive continuous particle rendering.
// Use the `time` value as a layer dependency to force re-creation each frame,
// or pass `_animate: true` to the DeckGL component instead.

import { useEffect, useRef, useState } from "react";

export function useAnimationLoop() {
  const [time, setTime] = useState(0);
  const animRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      setTime((t) => t + 1);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return time;
}
