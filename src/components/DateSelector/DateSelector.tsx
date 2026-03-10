import { Box, Input } from "@chakra-ui/react";

export interface DateSelectorProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const POSITION_STYLES: Record<NonNullable<DateSelectorProps["position"]>, object> = {
  "top-left": { top: 2, left: 2 },
  "top-right": { top: 2, right: 2 },
  "bottom-left": { bottom: 8, left: 2 },
  "bottom-right": { bottom: 8, right: 2 },
};

function toDateString(date: Date): string {
  const y = date.getFullYear().toString().padStart(4, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DateSelector({
  value,
  onChange,
  minDate,
  maxDate,
  position = "top-right",
}: DateSelectorProps) {
  return (
    <Box
      position="absolute"
      {...POSITION_STYLES[position]}
      zIndex={10}
      rounded="md"
      borderWidth="1px"
      borderColor="gray.200"
      bg="rgba(255,255,255,0.9)"
      boxShadow="lg"
      p={2}
      _dark={{ bg: "rgba(30,30,30,0.95)", borderColor: "gray.700" }}
    >
      <Input
        type="date"
        size="sm"
        value={value ? toDateString(value) : ""}
        min={minDate ? toDateString(minDate) : undefined}
        max={maxDate ? toDateString(maxDate) : undefined}
        onChange={(e) => {
          const val = e.target.value;
          if (!val) {
            onChange(null);
            return;
          }
          const [y, m, d] = val.split("-").map(Number);
          onChange(new Date(y, m - 1, d));
        }}
        aria-label="Select date"
      />
    </Box>
  );
}
