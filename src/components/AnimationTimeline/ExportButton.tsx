import { Box, Flex, Spinner } from "@chakra-ui/react";

interface ExportButtonProps {
  onExport: (format: "webm") => void;
  isExporting: boolean;
}

export function ExportButton({ onExport, isExporting }: ExportButtonProps) {
  return (
    <Flex gap={1} flexShrink={0}>
      <Box
        as="button"
        onClick={() => onExport("webm")}
        {...({ disabled: isExporting } as object)}
        border="1px solid"
        borderColor="gray.200"
        bg="white"
        borderRadius="4px"
        px={2}
        py={1}
        fontSize="10px"
        color="gray.700"
        fontWeight={500}
        cursor={isExporting ? "not-allowed" : "pointer"}
        opacity={isExporting ? 0.4 : 1}
        aria-label={isExporting ? "Exporting..." : "Export animation"}
        _dark={{ bg: "gray.700", borderColor: "gray.600", color: "gray.200" }}
      >
        {isExporting ? <Spinner size="xs" /> : "Export"}
      </Box>
    </Flex>
  );
}
