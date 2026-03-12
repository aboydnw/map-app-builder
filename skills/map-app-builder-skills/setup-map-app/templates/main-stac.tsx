import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StacApiProvider } from "stac-react";
import { MapToolProvider } from "@maptool/core";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <StacApiProvider apiUrl="https://earth-search.aws.element84.com/v1">
        <MapToolProvider>
          <App />
        </MapToolProvider>
      </StacApiProvider>
    </QueryClientProvider>
  </StrictMode>
);
