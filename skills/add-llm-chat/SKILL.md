# Skill: Add an LLM Chat Panel

## When to use
When you want a chat-style UI for LLM-powered interactions within a map application — for example, a natural language interface for querying map data, asking questions about visible features, or controlling the map via conversation. This component provides the UI shell only; LLM integration is handled by the parent.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `@chakra-ui/react` installed (LLMChatPanel uses Chakra's `Box`, `HStack`, `Input`, `Spinner`, `Text`, `VStack`)

## Steps

### 1. Import the component

```tsx
import { LLMChatPanel } from "@maptool/core";
import type { ChatMessage } from "@maptool/core";
```

### 2. Set up message state

```tsx
import { useState } from "react";

const [messages, setMessages] = useState<ChatMessage[]>([]);
const [isLoading, setIsLoading] = useState(false);
```

### 3. Handle sending messages

The parent manages all message state and LLM calls:

```tsx
async function handleSend(text: string) {
  const userMsg: ChatMessage = { role: "user", content: text };
  setMessages((prev) => [...prev, userMsg]);
  setIsLoading(true);

  try {
    // Replace with your actual LLM API call
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
```

### 4. Render the chat panel

As a standalone panel:

```tsx
<LLMChatPanel
  messages={messages}
  onSend={handleSend}
  isLoading={isLoading}
  placeholder="Ask about the map..."
  height={400}
/>
```

Or embedded inside a DetailsPanel for a side-panel chat:

```tsx
import { DetailsPanel } from "@maptool/core";

<DetailsPanel title="Map Assistant" isOpen={chatOpen} onClose={() => setChatOpen(false)}>
  <LLMChatPanel
    messages={messages}
    onSend={handleSend}
    isLoading={isLoading}
    placeholder="Ask about the map..."
    height="100%"
  />
</DetailsPanel>
```

### 5. Verify

Run `npm run dev` and confirm:
- [ ] The chat panel renders with an input field and send button
- [ ] Typing a message and pressing Enter (or clicking Send) triggers `onSend`
- [ ] User messages appear right-aligned in blue
- [ ] Assistant messages appear left-aligned in gray
- [ ] A spinner appears while `isLoading` is true
- [ ] The message list auto-scrolls to the latest message
- [ ] The input is disabled while loading

## Props reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `messages` | `ChatMessage[]` | required | Array of `{ role: "user" \| "assistant", content: string }` |
| `onSend` | `(message: string) => void` | required | Called with trimmed input text when user sends a message |
| `isLoading` | `boolean` | `false` | Shows a spinner and disables input while true |
| `placeholder` | `string` | `"Type a message..."` | Input field placeholder text |
| `height` | `number \| string` | `400` | Panel height in px or CSS value |

## Common mistakes
- **Expecting built-in LLM integration** — this is a UI-only component. You must implement the LLM API call, message state management, and any map-interaction logic in the parent.
- **Not managing `isLoading`** — without setting `isLoading` to true during API calls, users can send multiple messages before the first response arrives.
- **Mutating the messages array** — always use a state setter that creates a new array (`[...prev, newMsg]`). Mutating in place won't trigger a re-render.

## Reference files
- `src/components/LLMChatPanel/LLMChatPanel.tsx` — component source, `LLMChatPanelProps`, `ChatMessage`
