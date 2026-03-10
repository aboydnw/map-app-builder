import { useState } from "react";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";

export interface LayerConfig {
  id: string;
  label: string;
  visible: boolean;
  color?: string;
}

export interface LayerSelectorProps {
  layers: LayerConfig[];
  onToggle: (id: string) => void;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  collapsible?: boolean;
}

const POSITION_STYLES: Record<NonNullable<LayerSelectorProps["position"]>, object> = {
  "top-left": { top: 2, left: 2 },
  "top-right": { top: 2, right: 2 },
  "bottom-left": { bottom: 8, left: 2 },
  "bottom-right": { bottom: 8, right: 2 },
};

const collapseButtonStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 12px",
  fontSize: "10px",
  fontWeight: 600,
  textTransform: "uppercase",
  color: "#6b7280",
  background: "none",
  border: "none",
  cursor: "pointer",
};

const toggleButtonStyle = (visible: boolean): React.CSSProperties => ({
  height: "14px",
  width: "14px",
  borderRadius: "4px",
  border: `1px solid ${visible ? "#3b82f6" : "#e5e7eb"}`,
  background: visible ? "#3b82f6" : "white",
  flexShrink: 0,
  padding: 0,
  cursor: "pointer",
});

export function LayerSelector({
  layers,
  onToggle,
  position = "top-right",
  collapsible = true,
}: LayerSelectorProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box
      position="absolute"
      {...POSITION_STYLES[position]}
      zIndex={10}
      maxW="240px"
      minW="180px"
      rounded="md"
      borderWidth="1px"
      borderColor="gray.200"
      bg="rgba(255,255,255,0.9)"
      boxShadow="lg"
      role="region"
      aria-label="Layer selector"
      _dark={{ bg: "rgba(30,30,30,0.95)", borderColor: "gray.700" }}
    >
      {collapsible ? (
        <button
          type="button"
          style={collapseButtonStyle}
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          aria-controls="maptool-layer-selector-content"
        >
          <span>Layers</span>
          <span>{collapsed ? "▸" : "▾"}</span>
        </button>
      ) : null}

      {!collapsed ? (
        <Flex id="maptool-layer-selector-content" p={3} direction="column" gap={2}>
          {layers.map((layer) => (
            <HStack key={layer.id} justify="space-between">
              <HStack gap={2}>
                {layer.color ? (
                  <Box w="12px" h="12px" rounded="sm" bg={layer.color} flexShrink={0} />
                ) : null}
                <Text fontSize="sm" color="gray.800" _dark={{ color: "gray.50" }}>
                  {layer.label}
                </Text>
              </HStack>
              <button
                type="button"
                style={toggleButtonStyle(layer.visible)}
                onClick={() => onToggle(layer.id)}
                aria-label={`Toggle ${layer.label} visibility`}
                aria-pressed={layer.visible}
              />
            </HStack>
          ))}
        </Flex>
      ) : null}
    </Box>
  );
}
