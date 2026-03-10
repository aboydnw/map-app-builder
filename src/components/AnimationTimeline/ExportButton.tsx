import { Button, Spinner } from "@chakra-ui/react";

interface ExportButtonProps {
  onExport: (format: "webm") => void;
  isExporting: boolean;
}

export function ExportButton({ onExport, isExporting }: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      size="xs"
      onClick={() => onExport("webm")}
      disabled={isExporting}
      aria-label={isExporting ? "Exporting..." : "Export animation"}
    >
      {isExporting ? <Spinner size="xs" /> : "Export"}
    </Button>
  );
}
