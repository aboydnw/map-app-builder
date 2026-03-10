import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test-utils";
import { LLMChatPanel } from "./LLMChatPanel";
import type { ChatMessage } from "./LLMChatPanel";

describe("LLMChatPanel", () => {
  const messages: ChatMessage[] = [
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi there!" }
  ];

  it("renders messages", () => {
    renderWithProvider(<LLMChatPanel messages={messages} onSend={vi.fn()} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("calls onSend when send button is clicked", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    renderWithProvider(<LLMChatPanel messages={[]} onSend={onSend} />);

    const input = screen.getByLabelText("Chat input");
    await user.type(input, "test message");
    await user.click(screen.getByLabelText("Send message"));

    expect(onSend).toHaveBeenCalledWith("test message");
  });

  it("calls onSend on Enter key press", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    renderWithProvider(<LLMChatPanel messages={[]} onSend={onSend} />);

    const input = screen.getByLabelText("Chat input");
    await user.type(input, "enter test{Enter}");

    expect(onSend).toHaveBeenCalledWith("enter test");
  });

  it("clears input after sending", async () => {
    const user = userEvent.setup();
    renderWithProvider(<LLMChatPanel messages={[]} onSend={vi.fn()} />);

    const input = screen.getByLabelText("Chat input");
    await user.type(input, "hello{Enter}");

    expect(input).toHaveValue("");
  });

  it("disables input when loading", () => {
    renderWithProvider(<LLMChatPanel messages={[]} onSend={vi.fn()} isLoading />);
    expect(screen.getByLabelText("Chat input")).toBeDisabled();
  });

  it("shows spinner when loading", () => {
    renderWithProvider(<LLMChatPanel messages={[]} onSend={vi.fn()} isLoading />);
    expect(screen.getByText("", { selector: ".chakra-spinner" }) || screen.getByRole("status")).toBeTruthy();
  });

  it("does not call onSend for empty input", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    renderWithProvider(<LLMChatPanel messages={[]} onSend={onSend} />);

    await user.click(screen.getByLabelText("Send message"));
    expect(onSend).not.toHaveBeenCalled();
  });
});
