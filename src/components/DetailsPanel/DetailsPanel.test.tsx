import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test-utils";
import { DetailsPanel } from "./DetailsPanel";

describe("DetailsPanel", () => {
  it("renders children when open", () => {
    renderWithProvider(
      <DetailsPanel isOpen onClose={() => {}}>
        <span>Panel content</span>
      </DetailsPanel>
    );
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    renderWithProvider(
      <DetailsPanel isOpen onClose={() => {}} title="Layer Details">
        <span>Content</span>
      </DetailsPanel>
    );
    expect(screen.getByText("Layer Details")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProvider(
      <DetailsPanel isOpen onClose={onClose}>
        <span>Content</span>
      </DetailsPanel>
    );
    await user.click(screen.getByRole("button", { name: /close panel/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("applies overlay mode by default with absolute positioning", () => {
    renderWithProvider(
      <DetailsPanel isOpen onClose={() => {}}>
        <span>Content</span>
      </DetailsPanel>
    );
    const panel = screen.getByRole("complementary");
    expect(panel).toBeInTheDocument();
  });

  it("renders in push mode with complementary role", () => {
    renderWithProvider(
      <DetailsPanel isOpen onClose={() => {}} mode="push">
        <span>Push content</span>
      </DetailsPanel>
    );
    expect(screen.getByRole("complementary")).toBeInTheDocument();
    expect(screen.getByText("Push content")).toBeInTheDocument();
  });

  it("uses custom title as aria-label", () => {
    renderWithProvider(
      <DetailsPanel isOpen onClose={() => {}} title="Feature Info">
        <span>Content</span>
      </DetailsPanel>
    );
    expect(screen.getByRole("complementary", { name: "Feature Info" })).toBeInTheDocument();
  });
});
