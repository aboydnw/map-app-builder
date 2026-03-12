// Pattern: Testing a hook with multiple interaction modes (hover, click, multi-select)
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useFeatureState } from "@maptool/core";

describe("useFeatureState", () => {
  it("tracks hover state", () => {
    const { result } = renderHook(() => useFeatureState());
    const feature = { id: 1, name: "test" };
    act(() => result.current.onHover({ object: feature, x: 100, y: 200 }));
    expect(result.current.hoveredFeature).toBe(feature);
    expect(result.current.hoverCoordinates).toEqual({ x: 100, y: 200 });
  });

  it("manages single selection", () => {
    const { result } = renderHook(() => useFeatureState());
    const f1 = { id: 1 };
    act(() => result.current.onClick({ object: f1, x: 0, y: 0 }));
    expect(result.current.selectedFeatures).toEqual([f1]);
  });

  it("toggles multi-selection", () => {
    const { result } = renderHook(() => useFeatureState({ multiSelect: true }));
    const f1 = { id: 1 };
    const f2 = { id: 2 };
    act(() => result.current.onClick({ object: f1, x: 0, y: 0 }));
    act(() => result.current.onClick({ object: f2, x: 0, y: 0 }));
    expect(result.current.selectedFeatures).toEqual([f1, f2]);
  });

  it("returns correct cursor", () => {
    const { result } = renderHook(() => useFeatureState());
    expect(result.current.getCursor({ isDragging: false })).toBe("grab");
    act(() => result.current.onHover({ object: { id: 1 }, x: 0, y: 0 }));
    expect(result.current.getCursor({ isDragging: false })).toBe("pointer");
  });
});
