// Two patterns for rendering LLMChatPanel:
// 1. Standalone panel with fixed height
// 2. Embedded inside a DetailsPanel for a side-panel chat

import { useState } from "react";
import { LLMChatPanel, DetailsPanel } from "@maptool/core";
import type { ChatMessage } from "@maptool/core";

// --- Pattern 1: Standalone ---

function StandaloneChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSend(text: string) {
    // See templates/chat-handler.ts for full implementation
  }

  return (
    <LLMChatPanel
      messages={messages}
      onSend={handleSend}
      isLoading={isLoading}
      placeholder="Ask about the map..."
      height={400}
    />
  );
}

// --- Pattern 2: Embedded in DetailsPanel ---

function EmbeddedChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);

  async function handleSend(text: string) {
    // See templates/chat-handler.ts for full implementation
  }

  return (
    <DetailsPanel
      title="Map Assistant"
      isOpen={chatOpen}
      onClose={() => setChatOpen(false)}
    >
      <LLMChatPanel
        messages={messages}
        onSend={handleSend}
        isLoading={isLoading}
        placeholder="Ask about the map..."
        height="100%"
      />
    </DetailsPanel>
  );
}
