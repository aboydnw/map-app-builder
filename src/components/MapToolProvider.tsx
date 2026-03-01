import { ChakraProvider } from "@chakra-ui/react";
import { maptoolSystem } from "../theme";

interface MapToolProviderProps {
  children: React.ReactNode;
}

export function MapToolProvider({ children }: MapToolProviderProps) {
  return <ChakraProvider value={maptoolSystem}>{children}</ChakraProvider>;
}
