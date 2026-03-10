import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test-utils";
import { LayerSelector } from "./LayerSelector";

describe("LayerSelector", () => {
  const layers = [
    { id: "buildings", label: "Buildings", visible: true, color: "#ff0000" },
    { id: "roads", label: "Roads", visible: false, color: "#0000ff" },
  ];

  it("renders all layers", () => {
    renderWithProvider(<LayerSelector layers={layers} onToggle={() => {}} />);
    expect(screen.getByRole("region", { name: /layer selector/i })).toBeInTheDocument();
    expect(screen.getByText("Buildings")).toBeInTheDocument();
    expect(screen.getByText("Roads")).toBeInTheDocument();
  });

  it("calls onToggle with the layer id when toggle clicked", () => {
    const onToggle = vi.fn();
    renderWithProvider(<LayerSelector layers={layers} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("button", { name: /toggle roads visibility/i }));
    expect(onToggle).toHaveBeenCalledWith("roads");
  });

  it("collapses content when header clicked", () => {
    renderWithProvider(<LayerSelector layers={layers} onToggle={() => {}} collapsible />);
    fireEvent.click(screen.getByRole("button", { name: /layers/i }));
    expect(screen.queryByText("Buildings")).not.toBeInTheDocument();
    expect(screen.queryByText("Roads")).not.toBeInTheDocument();
  });

  it("expands content when header clicked again", () => {
    renderWithProvider(<LayerSelector layers={layers} onToggle={() => {}} collapsible />);
    fireEvent.click(screen.getByRole("button", { name: /layers/i }));
    fireEvent.click(screen.getByRole("button", { name: /layers/i }));
    expect(screen.getByText("Buildings")).toBeInTheDocument();
  });

  it("renders without collapse button when collapsible is false", () => {
    renderWithProvider(<LayerSelector layers={layers} onToggle={() => {}} collapsible={false} />);
    expect(screen.queryByRole("button", { name: /layers/i })).not.toBeInTheDocument();
    expect(screen.getByText("Buildings")).toBeInTheDocument();
  });
});
