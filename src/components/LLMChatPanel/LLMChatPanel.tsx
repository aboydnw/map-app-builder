import { useEffect, useRef, useState } from "react";
import { Box, HStack, Input, Spinner, Text, VStack } from "@chakra-ui/react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LLMChatPanelProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  height?: number | string;
}

/** Chat panel UI for LLM-powered conversations. */
export function LLMChatPanel({
  messages,
  onSend,
  isLoading = false,
  placeholder = "Type a message…",
  height = 400
}: LLMChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      height={height}
      display="flex"
      flexDirection="column"
      borderWidth="1px"
      borderColor="gray.200"
      rounded="md"
      bg="white"
      _dark={{ bg: "gray.800", borderColor: "gray.600" }}
    >
      <VStack
        ref={scrollRef}
        flex={1}
        overflowY="auto"
        p={3}
        gap={2}
        align="stretch"
      >
        {messages.map((msg, i) => (
          <Box
            key={i}
            alignSelf={msg.role === "user" ? "flex-end" : "flex-start"}
            maxW="80%"
            px={3}
            py={2}
            rounded="lg"
            bg={msg.role === "user" ? "blue.500" : "gray.100"}
            color={msg.role === "user" ? "white" : "gray.900"}
            _dark={
              msg.role === "user"
                ? { bg: "blue.400", color: "white" }
                : { bg: "gray.700", color: "gray.100" }
            }
          >
            <Text fontSize="sm" whiteSpace="pre-wrap">
              {msg.content}
            </Text>
          </Box>
        ))}
        {isLoading && (
          <Box alignSelf="flex-start">
            <Spinner size="sm" color="blue.500" />
          </Box>
        )}
      </VStack>

      <HStack p={2} borderTopWidth="1px" borderColor="gray.200" _dark={{ borderColor: "gray.600" }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          size="sm"
          aria-label="Chat input"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          style={{
            padding: "4px 12px",
            fontSize: "14px",
            cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
            opacity: isLoading || !input.trim() ? 0.5 : 1
          }}
        >
          Send
        </button>
      </HStack>
    </Box>
  );
}
