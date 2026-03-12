// Example handleSend function for LLMChatPanel.
// Replace the fetch URL with your actual LLM API endpoint.

import type { ChatMessage } from "@maptool/core";

export async function handleSend(
  text: string,
  messages: ChatMessage[],
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const userMsg: ChatMessage = { role: "user", content: text };
  setMessages((prev) => [...prev, userMsg]);
  setIsLoading(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg] }),
    });
    const data = await response.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.reply },
    ]);
  } catch {
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Sorry, something went wrong." },
    ]);
  } finally {
    setIsLoading(false);
  }
}
