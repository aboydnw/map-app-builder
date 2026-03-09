import { describe, it, expect } from "vitest";
import { hexToRgba, buildContinuousAccessor, buildCategoricalAccessor } from "./color-accessors";

describe("hexToRgba", () => {
  it("converts a 6-digit hex to RGBA with default alpha", () => {
    expect(hexToRgba("#ff0000")).toEqual([255, 0, 0, 255]);
  });

  it("converts a hex without hash prefix", () => {
    expect(hexToRgba("00ff00")).toEqual([0, 255, 0, 255]);
  });

  it("applies a custom alpha value", () => {
    expect(hexToRgba("#0000ff", 128)).toEqual([0, 0, 255, 128]);
  });

  it("handles black", () => {
    expect(hexToRgba("#000000")).toEqual([0, 0, 0, 255]);
  });

  it("handles white", () => {
    expect(hexToRgba("#ffffff")).toEqual([255, 255, 255, 255]);
  });
});

describe("buildContinuousAccessor", () => {
  const accessor = buildContinuousAccessor("value", [0, 100], "viridis", 200);

  it("returns a transparent color for NaN values", () => {
    const result = accessor({ properties: { value: "not-a-number" } });
    expect(result).toEqual([0, 0, 0, 0]);
  });

  it("returns the first palette color for the domain minimum", () => {
    const result = accessor({ properties: { value: 0 } });
    expect(result[3]).toBe(200);
    expect(result.length).toBe(4);
  });

  it("returns the last palette color for the domain maximum", () => {
    const result = accessor({ properties: { value: 100 } });
    expect(result[3]).toBe(200);
  });

  it("clamps values below the domain minimum", () => {
    const atMin = accessor({ properties: { value: 0 } });
    const belowMin = accessor({ properties: { value: -50 } });
    expect(belowMin).toEqual(atMin);
  });

  it("clamps values above the domain maximum", () => {
    const atMax = accessor({ properties: { value: 100 } });
    const aboveMax = accessor({ properties: { value: 200 } });
    expect(aboveMax).toEqual(atMax);
  });
});

describe("buildCategoricalAccessor", () => {
  const categories = [
    { value: "A", color: "#ff0000" },
    { value: "B", color: "#00ff00" }
  ];
  const fallback: [number, number, number, number] = [128, 128, 128, 200];
  const accessor = buildCategoricalAccessor("type", categories, fallback, 200);

  it("returns the mapped color for a known category", () => {
    const result = accessor({ properties: { type: "A" } });
    expect(result).toEqual([255, 0, 0, 200]);
  });

  it("returns the mapped color for another known category", () => {
    const result = accessor({ properties: { type: "B" } });
    expect(result).toEqual([0, 255, 0, 200]);
  });

  it("returns the fallback color for an unknown category", () => {
    const result = accessor({ properties: { type: "C" } });
    expect(result).toEqual(fallback);
  });
});
