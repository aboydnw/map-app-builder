import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test-utils";
import { DateSelector } from "./DateSelector";

describe("DateSelector", () => {
  it("renders a date input", () => {
    renderWithProvider(<DateSelector value={null} onChange={() => {}} />);
    expect(screen.getByLabelText("Select date")).toBeInTheDocument();
  });

  it("displays the provided date value", () => {
    renderWithProvider(
      <DateSelector value={new Date(2025, 5, 15)} onChange={() => {}} />
    );
    const input = screen.getByLabelText("Select date") as HTMLInputElement;
    expect(input.value).toBe("2025-06-15");
  });

  it("calls onChange with a Date when a date is selected", () => {
    const onChange = vi.fn();
    renderWithProvider(<DateSelector value={null} onChange={onChange} />);
    const input = screen.getByLabelText("Select date");
    fireEvent.change(input, { target: { value: "2025-03-20" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(20);
  });

  it("calls onChange with null when input is cleared", () => {
    const onChange = vi.fn();
    renderWithProvider(
      <DateSelector value={new Date(2025, 0, 1)} onChange={onChange} />
    );
    const input = screen.getByLabelText("Select date");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("sets min and max attributes from minDate and maxDate", () => {
    renderWithProvider(
      <DateSelector
        value={null}
        onChange={() => {}}
        minDate={new Date(2024, 0, 1)}
        maxDate={new Date(2025, 11, 31)}
      />
    );
    const input = screen.getByLabelText("Select date") as HTMLInputElement;
    expect(input.min).toBe("2024-01-01");
    expect(input.max).toBe("2025-12-31");
  });
});
