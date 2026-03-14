import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { Header } from "../components/Header";
import { ShareButton } from "../components/ShareButton";
import { CreditsPanel } from "../components/CreditsPanel";
import { RasterMap } from "../components/RasterMap";
import { VectorMap } from "../components/VectorMap";
import { config } from "../config";
import type { Dataset } from "../types";

export default function MapPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDataset() {
      try {
        const resp = await fetch(`${config.apiBase}/api/datasets/${id}`);
        if (resp.status === 404) {
          navigate(`/expired/${id}`, { replace: true });
          return;
        }
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data: Dataset = await resp.json();

        const created = new Date(data.created_at);
        const expiry = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (new Date() > expiry) {
          navigate(`/expired/${id}`, { replace: true });
          return;
        }

        setDataset(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load dataset");
      } finally {
        setLoading(false);
      }
    }
    fetchDataset();
  }, [id, navigate]);

  if (loading) {
    return (
      <Box minH="100vh" bg="white">
        <Header />
        <Flex align="center" justify="center" h="calc(100vh - 56px)">
          <Spinner size="lg" color="brand.orange" />
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="white">
        <Header />
        <Flex direction="column" align="center" justify="center" h="calc(100vh - 56px)" gap={4}>
          <Text color="red.500">{error}</Text>
          <Button
            bg="brand.orange"
            color="white"
            onClick={() => {
              setError(null);
              setLoading(true);
              window.location.reload();
            }}
          >
            Retry
          </Button>
        </Flex>
      </Box>
    );
  }

  if (!dataset) return null;

  return (
    <Box h="100vh" display="flex" flexDirection="column">
      <Header>
        <ShareButton />
        <Button
          bg="brand.bgSubtle"
          color="brand.brown"
          size="sm"
          fontWeight={500}
          borderRadius="4px"
          asChild
        >
          <Link to="/">New upload</Link>
        </Button>
      </Header>

      <Flex flex={1} overflow="hidden">
        <Box flex={7} position="relative">
          {dataset.dataset_type === "raster" ? (
            <RasterMap dataset={dataset} />
          ) : (
            <VectorMap dataset={dataset} />
          )}
        </Box>

        <Box
          flex={3}
          display={{ base: "none", md: "block" }}
          overflow="auto"
        >
          <CreditsPanel dataset={dataset} />
        </Box>
      </Flex>
    </Box>
  );
}
