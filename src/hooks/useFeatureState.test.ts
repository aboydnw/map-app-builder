import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useFeatureState } from "./useFeatureState";

describe("useFeatureState", () => {
  it("initializes with no hovered or selected features", () => {
    const { result } = renderHook(() => useFeatureState());
    expect(result.current.hoveredFeature).toBeNull();
    expect(result.current.selectedFeatures).toEqual([]);
    expect(result.current.hoverCoordinates).toBeNull();
  });

  it("sets hovered feature on hover", () => {
    const { result } = renderHook(() => useFeatureState());
    const feature = { id: 1, name: "test" };
    act(() => result.current.onHover({ object: feature, x: 100, y: 200 }));
    expect(result.current.hoveredFeature).toBe(feature);
    expect(result.current.hoverCoordinates).toEqual({ x: 100, y: 200 });
  });

  it("clears hovered feature when hovering empty space", () => {
    const { result } = renderHook(() => useFeatureState());
    act(() => result.current.onHover({ object: { id: 1 }, x: 100, y: 200 }));
    act(() => result.current.onHover({ x: 0, y: 0 }));
    expect(result.current.hoveredFeature).toBeNull();
    expect(result.current.hoverCoordinates).toBeNull();
  });

  it("selects feature on click (single mode)", () => {
    const { result } = renderHook(() => useFeatureState());
    const feature = { id: 1 };
    act(() => result.current.onClick({ object: feature, x: 100, y: 200 }));
    expect(result.current.selectedFeatures).toEqual([feature]);
  });

  it("replaces selection on second click (single mode)", () => {
    const { result } = renderHook(() => useFeatureState());
    const f1 = { id: 1 };
    const f2 = { id: 2 };
    act(() => result.current.onClick({ object: f1, x: 0, y: 0 }));
    act(() => result.current.onClick({ object: f2, x: 0, y: 0 }));
    expect(result.current.selectedFeatures).toEqual([f2]);
  });

  it("clears selection on empty click", () => {
    const { result } = renderHook(() => useFeatureState());
    act(() => result.current.onClick({ object: { id: 1 }, x: 0, y: 0 }));
    act(() => result.current.onClick({ x: 0, y: 0 }));
    expect(result.current.selectedFeatures).toEqual([]);
  });

  it("toggles features in multiSelect mode", () => {
    const { result } = renderHook(() => useFeatureState({ multiSelect: true }));
    const f1 = { id: 1 };
    const f2 = { id: 2 };
    act(() => result.current.onClick({ object: f1, x: 0, y: 0 }));
    act(() => result.current.onClick({ object: f2, x: 0, y: 0 }));
    expect(result.current.selectedFeatures).toEqual([f1, f2]);
    act(() => result.current.onClick({ object: f1, x: 0, y: 0 }));
    expect(result.current.selectedFeatures).toEqual([f2]);
  });

  it("clearSelection empties selection", () => {
    const { result } = renderHook(() => useFeatureState());
    act(() => result.current.onClick({ object: { id: 1 }, x: 0, y: 0 }));
    act(() => result.current.clearSelection());
    expect(result.current.selectedFeatures).toEqual([]);
  });

  it("getCursor returns correct cursor state", () => {
    const { result } = renderHook(() => useFeatureState());
    expect(result.current.getCursor({ isDragging: false })).toBe("grab");
    expect(result.current.getCursor({ isDragging: true })).toBe("grabbing");
    act(() => result.current.onHover({ object: { id: 1 }, x: 0, y: 0 }));
    expect(result.current.getCursor({ isDragging: false })).toBe("pointer");
  });
});
