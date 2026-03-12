# Skill: Add an LLM Chat Panel

## When to use
When you want a chat-style UI for LLM-powered interactions within a map application — for example, a natural language interface for querying map data, asking questions about visible features, or controlling the map via conversation. This component provides the UI shell only; LLM integration is handled by the parent.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `@chakra-ui/react` installed (LLMChatPanel uses Chakra's `Box`, `HStack`, `Input`, `Spinner`, `Text`, `VStack`)

## Template files

| File | Description |
|------|-------------|
| `templates/chat-handler.ts` | Example `handleSend` function with fetch-based LLM API call |
| `templates/chat-panel-example.tsx` | Standalone and DetailsPanel-embedded rendering patterns |

## Steps

### 1. Handle sending messages

See `templates/chat-handler.ts` for a complete `handleSend` function. The parent manages all message state and LLM calls — replace the fetch URL with your actual LLM API endpoint.

### 2. Render the chat panel

See `templates/chat-panel-example.tsx` for two rendering patterns:
- **Standalone panel** — fixed height, placed anywhere in your layout
- **Embedded in DetailsPanel** — side-panel chat with open/close state

### 3. Verify

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
