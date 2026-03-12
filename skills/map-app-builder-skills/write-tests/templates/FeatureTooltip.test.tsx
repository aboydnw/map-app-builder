// Pattern: Testing a simple presentational component with children
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FeatureTooltip } from "@maptool/core";

describe("FeatureTooltip", () => {
  it("renders children at specified position", () => {
    render(
      <FeatureTooltip x={100} y={200}>
        <span>County: Adams</span>
      </FeatureTooltip>
    );
    expect(screen.getByText("County: Adams")).toBeInTheDocument();
  });
});
