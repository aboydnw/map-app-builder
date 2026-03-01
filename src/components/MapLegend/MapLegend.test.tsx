import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MapLegend } from "./MapLegend";

describe("MapLegend", () => {
  const continuousLayer = {
    type: "continuous" as const,
    id: "temp",
    title: "Temperature",
    unit: "C",
    domain: [0, 40] as [number, number],
    colors: ["#313695", "#ffffbf", "#a50026"],
    ticks: 3
  };

  it("renders legend region with title and unit", () => {
    render(
      <MapLegend layers={[continuousLayer]} />
    );
    expect(screen.getByRole("region", { name: /map legend/i })).toBeInTheDocument();
    expect(screen.getByText("Temperature (C)")).toBeInTheDocument();
  });

  it("renders continuous ramp tick labels", () => {
    render(<MapLegend layers={[continuousLayer]} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
  });

  it("collapses when legend header clicked", async () => {
    render(<MapLegend layers={[continuousLayer]} collapsible />);
    fireEvent.click(screen.getByRole("button", { name: /legend/i }));
    expect(screen.queryByText("Temperature (C)")).not.toBeInTheDocument();
  });

  it("calls onLayerToggle when toggler clicked", async () => {
    const user = userEvent.setup();
    const onLayerToggle = vi.fn();
    render(<MapLegend layers={[{ ...continuousLayer, toggler: true, visible: true }]} onLayerToggle={onLayerToggle} />);
    await user.click(screen.getByRole("button", { name: /toggle temperature visibility/i }));
    expect(onLayerToggle).toHaveBeenCalledWith("temp", false);
  });

  it("supports categorical legends", () => {
    render(
      <MapLegend
        layers={[
          {
            type: "categorical",
            id: "land-use",
            title: "Land Use",
            categories: [
              { value: "res", label: "Residential", color: "#ff0" },
              { value: "com", label: "Commercial", color: "#0ff" }
            ]
          }
        ]}
      />
    );
    expect(screen.getByText("Residential")).toBeInTheDocument();
    expect(screen.getByText("Commercial")).toBeInTheDocument();
  });
});
