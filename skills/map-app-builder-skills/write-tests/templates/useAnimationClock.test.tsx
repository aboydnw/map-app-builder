// Pattern: Testing a stateful hook with renderHook and act()
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useAnimationClock } from "@maptool/core";

describe("useAnimationClock", () => {
  it("initializes at index 0, not playing", () => {
    const { result } = renderHook(() =>
      useAnimationClock({ totalFrames: 10, fps: 2 })
    );
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  it("clamps setIndex to valid range", () => {
    const { result } = renderHook(() =>
      useAnimationClock({ totalFrames: 5, fps: 2 })
    );
    act(() => result.current.setIndex(99));
    expect(result.current.currentIndex).toBe(4);
    act(() => result.current.setIndex(-1));
    expect(result.current.currentIndex).toBe(0);
  });

  it("stepForward wraps when looping", () => {
    const { result } = renderHook(() =>
      useAnimationClock({ totalFrames: 3, fps: 2, loop: true })
    );
    act(() => result.current.setIndex(2));
    act(() => result.current.stepForward());
    expect(result.current.currentIndex).toBe(0);
  });
});
