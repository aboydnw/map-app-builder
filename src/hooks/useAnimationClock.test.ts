import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAnimationClock } from "./useAnimationClock";

describe("useAnimationClock", () => {
  it("initializes with index 0 and paused", () => {
    const { result } = renderHook(() => useAnimationClock({ totalFrames: 5 }));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.speed).toBe(1);
  });

  it("steps forward/back and wraps in loop mode", () => {
    const { result } = renderHook(() => useAnimationClock({ totalFrames: 3, loop: true }));

    act(() => result.current.stepForward());
    expect(result.current.currentIndex).toBe(1);

    act(() => result.current.stepForward());
    expect(result.current.currentIndex).toBe(2);

    act(() => result.current.stepForward());
    expect(result.current.currentIndex).toBe(0);

    act(() => result.current.stepBack());
    expect(result.current.currentIndex).toBe(2);
  });

  it("clamps setIndex to valid bounds", () => {
    const { result } = renderHook(() => useAnimationClock({ totalFrames: 4 }));

    act(() => result.current.setIndex(99));
    expect(result.current.currentIndex).toBe(3);

    act(() => result.current.setIndex(-10));
    expect(result.current.currentIndex).toBe(0);
  });
});
