import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test-utils";
import { AOISelector } from "./AOISelector";
import type { Polygon } from "geojson";

const samplePolygon: Polygon = {
  type: "Polygon",
  coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
};

describe("AOISelector", () => {
  it("renders the Draw AOI and Upload buttons", () => {
    renderWithProvider(
      <AOISelector onAOIChange={() => {}} onToggle={() => {}} />
    );
    expect(screen.getByText("Draw AOI")).toBeInTheDocument();
    expect(screen.getByText("Upload")).toBeInTheDocument();
  });

  it("does not render Draw AOI button when onToggle is not provided", () => {
    renderWithProvider(<AOISelector onAOIChange={() => {}} />);
    expect(screen.queryByText("Draw AOI")).not.toBeInTheDocument();
    expect(screen.getByText("Upload")).toBeInTheDocument();
  });

  it("fires onToggle when Draw AOI is clicked", () => {
    const onToggle = vi.fn();
    renderWithProvider(
      <AOISelector onAOIChange={() => {}} onToggle={onToggle} />
    );
    fireEvent.click(screen.getByText("Draw AOI"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("highlights Draw AOI button when active", () => {
    renderWithProvider(
      <AOISelector onAOIChange={() => {}} onToggle={() => {}} active />
    );
    expect(screen.getByText("Draw AOI")).toHaveAttribute("aria-pressed", "true");
  });

  it("shows Clear button and AOI active text when currentAOI is set", () => {
    renderWithProvider(
      <AOISelector
        onAOIChange={() => {}}
        currentAOI={samplePolygon}
      />
    );
    expect(screen.getByText("Clear")).toBeInTheDocument();
    expect(screen.getByText("AOI active")).toBeInTheDocument();
  });

  it("fires onAOIChange with null when Clear is clicked", () => {
    const onAOIChange = vi.fn();
    renderWithProvider(
      <AOISelector onAOIChange={onAOIChange} currentAOI={samplePolygon} />
    );
    fireEvent.click(screen.getByText("Clear"));
    expect(onAOIChange).toHaveBeenCalledWith(null);
  });

  it("does not show Clear button when no AOI is set", () => {
    renderWithProvider(<AOISelector onAOIChange={() => {}} />);
    expect(screen.queryByText("Clear")).not.toBeInTheDocument();
    expect(screen.queryByText("AOI active")).not.toBeInTheDocument();
  });

  it("parses uploaded GeoJSON Polygon and calls onAOIChange", async () => {
    const onAOIChange = vi.fn();
    renderWithProvider(<AOISelector onAOIChange={onAOIChange} />);

    const input = screen.getByTestId("aoi-file-input") as HTMLInputElement;
    const file = new File(
      [JSON.stringify(samplePolygon)],
      "aoi.geojson",
      { type: "application/json" }
    );
    fireEvent.change(input, { target: { files: [file] } });

    await vi.waitFor(() => {
      expect(onAOIChange).toHaveBeenCalledWith(samplePolygon);
    });
  });

  it("parses uploaded GeoJSON Feature and extracts Polygon", async () => {
    const onAOIChange = vi.fn();
    renderWithProvider(<AOISelector onAOIChange={onAOIChange} />);

    const feature = {
      type: "Feature",
      properties: {},
      geometry: samplePolygon,
    };
    const input = screen.getByTestId("aoi-file-input") as HTMLInputElement;
    const file = new File(
      [JSON.stringify(feature)],
      "aoi.geojson",
      { type: "application/json" }
    );
    fireEvent.change(input, { target: { files: [file] } });

    await vi.waitFor(() => {
      expect(onAOIChange).toHaveBeenCalledWith(samplePolygon);
    });
  });

  it("parses uploaded FeatureCollection and extracts first Polygon", async () => {
    const onAOIChange = vi.fn();
    renderWithProvider(<AOISelector onAOIChange={onAOIChange} />);

    const fc = {
      type: "FeatureCollection",
      features: [
        { type: "Feature", properties: {}, geometry: samplePolygon },
      ],
    };
    const input = screen.getByTestId("aoi-file-input") as HTMLInputElement;
    const file = new File(
      [JSON.stringify(fc)],
      "aoi.geojson",
      { type: "application/json" }
    );
    fireEvent.change(input, { target: { files: [file] } });

    await vi.waitFor(() => {
      expect(onAOIChange).toHaveBeenCalledWith(samplePolygon);
    });
  });
});
