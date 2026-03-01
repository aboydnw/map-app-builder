import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { maptoolSystem } from "./theme";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={maptoolSystem}>{children}</ChakraProvider>;
}

export function renderWithProvider(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): RenderResult {
  return render(ui, { wrapper: Wrapper, ...options });
}
