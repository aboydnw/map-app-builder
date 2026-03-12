// Keyboard shortcuts for animation playback (Space, ArrowLeft, ArrowRight).
import { useEffect } from "react";
import type { useAnimationClock } from "@maptool/core";

type Clock = ReturnType<typeof useAnimationClock>;

function useAnimationKeyboardShortcuts(clock: Clock) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); clock.togglePlay(); }
      if (e.code === "ArrowLeft") clock.stepBack();
      if (e.code === "ArrowRight") clock.stepForward();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clock]);
}
