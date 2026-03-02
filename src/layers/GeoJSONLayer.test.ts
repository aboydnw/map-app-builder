import { describe, it, expect } from "vitest";
import { createGeoJSONLayer } from "./GeoJSONLayer";

const SAMPLE_DATA: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { value: 50, category: "A" },
      geometry: { type: "Point", coordinates: [0, 0] }
    },
    {
      type: "Feature",
      properties: { value: 100, category: "B" },
      geometry: { type: "Point", coordinates: [1, 1] }
    }
  ]
};

describe("createGeoJSONLayer", () => {
  it("creates a layer with default styling", () => {
    const layer = createGeoJSONLayer({ id: "test", data: SAMPLE_DATA });
    expect(layer.id).toBe("test");
    expect(layer.props.visible).toBe(true);
    expect(layer.props.pickable).toBe(true);
  });

  it("creates a layer with continuous color mapping", () => {
    const layer = createGeoJSONLayer({
      id: "continuous",
      data: SAMPLE_DATA,
      colorProperty: "value",
      colorMapping: { type: "continuous", domain: [0, 100], colormap: "viridis" }
    });
    expect(layer.id).toBe("continuous");
    expect(typeof layer.props.getFillColor).toBe("function");
  });

  it("creates a layer with categorical color mapping", () => {
    const layer = createGeoJSONLayer({
      id: "categorical",
      data: SAMPLE_DATA,
      colorProperty: "category",
      colorMapping: {
        type: "categorical",
        categories: [
          { value: "A", color: "#ff0000" },
          { value: "B", color: "#0000ff" }
        ]
      }
    });
    expect(layer.id).toBe("categorical");
    expect(typeof layer.props.getFillColor).toBe("function");
  });

  it("accepts a URL string for data", () => {
    const layer = createGeoJSONLayer({ id: "url", data: "https://example.com/data.geojson" });
    expect(layer.id).toBe("url");
  });

  it("respects visibility option", () => {
    const layer = createGeoJSONLayer({ id: "hidden", data: SAMPLE_DATA, visible: false });
    expect(layer.props.visible).toBe(false);
  });
});
