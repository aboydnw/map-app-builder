import { Box } from "@chakra-ui/react";

interface TimestampDisplayProps {
  current: string;
}

export function TimestampDisplay({ current }: TimestampDisplayProps) {
  return (
    <Box
      bg="gray.800"
      color="white"
      px={3}
      py={1}
      borderRadius="12px"
      fontSize="13px"
      fontWeight={600}
      _dark={{ bg: "gray.200", color: "gray.800" }}
    >
      {current}
    </Box>
  );
}
