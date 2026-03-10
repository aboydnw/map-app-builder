import type { ReactNode } from "react";
import { Box, CloseButton } from "@chakra-ui/react";

export interface DetailsPanelProps {
  title?: string;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  side?: "left" | "right";
  width?: number | string;
  mode?: "overlay" | "push";
}

export function DetailsPanel({
  title,
  children,
  isOpen,
  onClose,
  side = "right",
  width = 350,
  mode = "overlay"
}: DetailsPanelProps) {
  if (mode === "push") {
    return (
      <Box
        width={isOpen ? width : 0}
        overflow="hidden"
        transition="width 0.3s ease"
        flexShrink={0}
        bg="white"
        borderLeftWidth={side === "right" ? "1px" : undefined}
        borderRightWidth={side === "left" ? "1px" : undefined}
        borderColor="gray.200"
        _dark={{ bg: "gray.800", borderColor: "gray.700" }}
        role="complementary"
        aria-label={title ?? "Details panel"}
      >
        <Box width={width} height="100%" overflow="auto" p={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            {title && (
              <Box fontWeight="semibold" fontSize="lg">
                {title}
              </Box>
            )}
            <CloseButton onClick={onClose} aria-label="Close panel" ml="auto" />
          </Box>
          {children}
        </Box>
      </Box>
    );
  }

  const slideFrom = side === "right" ? "translateX(100%)" : "translateX(-100%)";

  return (
    <Box
      position="absolute"
      top={0}
      bottom={0}
      {...(side === "right" ? { right: 0 } : { left: 0 })}
      width={width}
      zIndex={20}
      bg="white"
      borderLeftWidth={side === "right" ? "1px" : undefined}
      borderRightWidth={side === "left" ? "1px" : undefined}
      borderColor="gray.200"
      boxShadow="lg"
      transform={isOpen ? "translateX(0)" : slideFrom}
      transition="transform 0.3s ease"
      overflow="auto"
      p={4}
      _dark={{ bg: "gray.800", borderColor: "gray.700" }}
      role="complementary"
      aria-label={title ?? "Details panel"}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        {title && (
          <Box fontWeight="semibold" fontSize="lg">
            {title}
          </Box>
        )}
        <CloseButton onClick={onClose} aria-label="Close panel" ml="auto" />
      </Box>
      {children}
    </Box>
  );
}
