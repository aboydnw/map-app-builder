import { Box, Flex, Link, Text } from "@chakra-ui/react";
import type { Dataset } from "../types";

interface CreditsPanelProps {
  dataset: Dataset;
}

function daysUntilExpiry(createdAt: string): number {
  const created = new Date(createdAt);
  const expiry = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  return Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export function CreditsPanel({ dataset }: CreditsPanelProps) {
  const passedCount = dataset.validation_results.filter((v) => v.passed).length;
  const totalCount = dataset.validation_results.length;
  const allPassed = passedCount === totalCount;
  const days = daysUntilExpiry(dataset.created_at);

  return (
    <Box
      w="100%"
      h="100%"
      bg="white"
      borderLeft="1px solid"
      borderColor="brand.border"
      p={6}
      overflowY="auto"
    >
      <Text
        fontSize="11px"
        textTransform="uppercase"
        letterSpacing="1px"
        color="brand.textSecondary"
        fontWeight={600}
        mb={4}
      >
        How this was made
      </Text>

      {dataset.credits.map((credit) => (
        <Box key={credit.tool} mb={4} pb={4} borderBottom="1px solid" borderColor="#f0eeeb">
          <Text color="brand.brown" fontSize="13px" fontWeight={600}>
            {credit.role} {credit.tool}
          </Text>
          <Link
            href={credit.url}
            target="_blank"
            rel="noopener noreferrer"
            color="brand.orange"
            fontSize="12px"
            fontWeight={500}
          >
            {(() => { try { return new URL(credit.url).host.replace("www.", ""); } catch { return credit.url; } })()} →
          </Link>
        </Box>
      ))}

      <Box mb={4} pb={4} borderBottom="1px solid" borderColor="#f0eeeb">
        <Text
          fontSize="11px"
          textTransform="uppercase"
          letterSpacing="1px"
          color="brand.textSecondary"
          fontWeight={600}
          mb={2}
        >
          Validation
        </Text>
        <Text
          color={allPassed ? "brand.success" : "red.500"}
          fontSize="13px"
          fontWeight={600}
        >
          {allPassed ? "✓" : "⚠"} {passedCount}/{totalCount} checks passed
        </Text>
      </Box>

      <Box mb={4} pb={4} borderBottom="1px solid" borderColor="#f0eeeb">
        <Text
          fontSize="11px"
          textTransform="uppercase"
          letterSpacing="1px"
          color="brand.textSecondary"
          fontWeight={600}
          mb={2}
        >
          What's next
        </Text>
        <Link
          display="block"
          color="brand.orange"
          fontSize="13px"
          fontWeight={600}
          mb={2}
          href="https://developmentseed.org/contact"
          target="_blank"
          rel="noopener noreferrer"
        >
          Turn this into a story →
        </Link>
        <Link
          display="block"
          color="brand.orange"
          fontSize="13px"
          fontWeight={500}
          href="https://developmentseed.org/contact"
          target="_blank"
          rel="noopener noreferrer"
        >
          Talk to Development Seed →
        </Link>
      </Box>

      <Text color="brand.textSecondary" fontSize="12px">
        ⏳ Expires in {days} day{days !== 1 ? "s" : ""}
      </Text>
    </Box>
  );
}
