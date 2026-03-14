import { useState, useRef, useCallback } from "react";
import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";

const ALLOWED_EXTENSIONS = [".tif", ".tiff", ".zip", ".geojson", ".json", ".nc"];

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  onUrlSubmitted: (url: string) => void;
  disabled?: boolean;
}

function getExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

export function FileUploader({
  onFileSelected,
  onUrlSubmitted,
  disabled,
}: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const ext = getExtension(file.name);
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`Unsupported format: ${ext}`);
        return;
      }
      setError(null);
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleUrlSubmit = useCallback(() => {
    if (url.trim()) {
      setError(null);
      onUrlSubmitted(url.trim());
    }
  }, [url, onUrlSubmitted]);

  return (
    <Flex direction="column" align="center" py={16} px={8}>
      <Text color="brand.brown" fontSize="22px" fontWeight={700} mb={1}>
        See your data on the web
      </Text>
      <Text color="brand.textSecondary" fontSize="14px" mb={9}>
        Upload a geospatial file and get a shareable map in minutes
      </Text>

      <Box
        border="2px dashed"
        borderColor={dragOver ? "brand.orange" : "#ccc"}
        borderRadius="12px"
        p={14}
        textAlign="center"
        w="100%"
        maxW="480px"
        bg={dragOver ? "orange.50" : "brand.bgSubtle"}
        cursor="pointer"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        opacity={disabled ? 0.5 : 1}
        pointerEvents={disabled ? "none" : "auto"}
      >
        <Text fontSize="40px" mb={4} opacity={0.5}>
          🗺
        </Text>
        <Text color="brand.brown" fontSize="16px" fontWeight={600} mb={2}>
          Drop your file here
        </Text>
        <Text color="brand.textSecondary" fontSize="13px" mb={5}>
          GeoTIFF · Shapefile (.zip) · GeoJSON · NetCDF
        </Text>
        <Button
          bg="brand.orange"
          color="white"
          size="sm"
          fontWeight={600}
          borderRadius="4px"
          _hover={{ bg: "brand.orangeHover" }}
        >
          Browse files
        </Button>
        <Text color="#aaa" fontSize="12px" mt={4}>
          Up to 1 GB
        </Text>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(",")}
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </Box>

      {error && (
        <Text color="red.500" fontSize="13px" mt={3}>
          {error}
        </Text>
      )}

      <Flex align="center" gap={4} w="100%" maxW="480px" mt={6}>
        <Box flex={1} h="1px" bg="brand.border" />
        <Text color="#aaa" fontSize="12px" textTransform="uppercase" letterSpacing="1px">
          or
        </Text>
        <Box flex={1} h="1px" bg="brand.border" />
      </Flex>

      <Flex gap={2} mt={5} w="100%" maxW="480px">
        <Input
          flex={1}
          placeholder="Paste an S3, GCS, or HTTP URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          size="md"
          borderColor="#ddd"
          disabled={disabled}
        />
        <Button
          bg="brand.brown"
          color="white"
          size="md"
          fontWeight={600}
          borderRadius="4px"
          onClick={handleUrlSubmit}
          disabled={disabled || !url.trim()}
        >
          Fetch
        </Button>
      </Flex>
    </Flex>
  );
}
