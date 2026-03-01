import { Box, Flex } from "@chakra-ui/react";
import type { HistogramBin } from "./types";

interface HistogramProps {
  bins: HistogramBin[];
  height?: number;
}

export function Histogram({ bins, height = 32 }: HistogramProps) {
  const maxCount = Math.max(...bins.map((bin) => bin.count), 1);

  return (
    <Flex alignItems="flex-end" gap="1px" opacity={0.7} style={{ height }}>
      {bins.map((bin, index) => (
        <Box
          key={`${bin.start}-${bin.end}-${index}`}
          flex={1}
          minW="1px"
          roundedTop="sm"
          bg="blue.100"
          _dark={{ bg: "blue.900" }}
          style={{ height: `${(bin.count / maxCount) * 100}%` }}
        />
      ))}
    </Flex>
  );
}
