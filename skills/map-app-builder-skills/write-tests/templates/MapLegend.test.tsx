// Pattern: Testing a component with props, rendered text, and user interaction callbacks
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { MapLegend } from "@maptool/core";

describe("MapLegend", () => {
  const layers = [{
    type: "continuous" as const,
    id: "temp",
    title: "Temperature",
    unit: "°C",
    domain: [0, 40] as [number, number],
    colors: ["#313695", "#ffffbf", "#a50026"],
    ticks: 3,
  }];

  it("renders title with unit", () => {
    render(<MapLegend layers={layers} />);
    expect(screen.getByText("Temperature (°C)")).toBeInTheDocument();
  });

  it("calls onLayerToggle when toggler clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(
      <MapLegend
        layers={[{ ...layers[0], toggler: true, visible: true }]}
        onLayerToggle={onToggle}
      />
    );
    await user.click(screen.getByRole("button", { name: /toggle temperature/i }));
    expect(onToggle).toHaveBeenCalledWith("temp", false);
  });
});
