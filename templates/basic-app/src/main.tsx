import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MapToolProvider } from "@maptool/core";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MapToolProvider>
      <App />
    </MapToolProvider>
  </StrictMode>
);
