import { Flex, Text } from "@chakra-ui/react";

interface TimestampDisplayProps {
  current: string;
  start: string;
  end: string;
}

export function TimestampDisplay({ current, start, end }: TimestampDisplayProps) {
  return (
    <Flex alignItems="center" gap={2} fontSize="xs" color="gray.500" _dark={{ color: "gray.400" }}>
      <Text as="span" fontWeight="medium" color="gray.800" _dark={{ color: "gray.50" }}>
        {current}
      </Text>
      <Text as="span">/</Text>
      <Text as="span">
        {start} - {end}
      </Text>
    </Flex>
  );
}
